/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableHead,
  Button,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Paper,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Alert } from '@material-ui/lab';
import SearchBar from 'material-ui-search-bar';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';
import useQuickSaleState from '../../stores/quickSale';
import { useRouter } from 'next/router';
import useConfirmationDialog from '../../hooks/useConfirmationDialog';
import ConfirmDialog from '../custom/ConfirmDialog';
import { addData, getAllData, openIndexedDB, clearData } from '../../utils/indexDBUtils';

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  divMargin: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function ProductsList({ edit, formState }) {
  const classes = useStyles();

  const router = useRouter();

  const { isDialogOpen, showConfirmationDialog, hideConfirmationDialog } =
    useConfirmationDialog();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const { setQuickSale } = useQuickSaleState();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedSearch = useDebounce(searchQuery, 500);

const fetchAndCacheProducts = async () => {
  try {
    const result = await API.get(`shops/${shopId}/products`);
    const items = result.data.data;
    
    setProducts(items);

    const db = await openIndexedDB('localdb', 1, [
      { name: 'products', keyPath: 'id', autoIncrement: false }
    ]);
    
    await clearData(db, 'products'); 

    for (const item of items) {
      await addData(db, 'products', item);
    }

  } catch (err) {
    const message = err.response?.data?.message || 'Failed to fetch products';
    setError(message);

    const db = await openIndexedDB('localdb', 1, [
      { name: 'products', keyPath: 'id', autoIncrement: false }
    ]);
    const cachedProducts = await getAllData(db, 'products');
    if (cachedProducts.length > 0) {
      setProducts(cachedProducts);
    }
  }
};

  // Step 2: Search products from IndexedDB based on debounced query
  async function searchProducts() {
    if (!debouncedSearch) {
      fetchAndCacheProducts();
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const db = await openIndexedDB('localdb', 1, [
        { name: 'products', keyPath: 'id', autoIncrement: false },
      ]);

      const cachedProducts = await getAllData(db, 'products');

      const filteredProducts = cachedProducts.filter((product) =>
        product.productName.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      setProducts(filteredProducts);
      setLoading(false);
    } catch (err) {
      const { message } = err;
      console.error('Error searching products:', message);
      setError(message);
      setLoading(false);
    }
  }


  const [deleteItem, setDeleteItem] = useState(null);
  const deleteProduct = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await API.delete(`products/${deleteItem}`);
      setSuccess('Successfully deleted product');
      fetchAndCacheProducts();
      setDeleteItem(null);
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
      setLoading(false);
      setDeleteItem(null);
    }
  };

  const editProduct = (product) => {
    edit(product);
  };


  const fetchPage = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    fetchAndCacheProducts();
  }, [shopId, limit]);

  // useEffect(() => {console.log('🚀🚀🚀🚀🚀🚀 ProductListFull',products)}, [products])

  useEffect(() => {
    searchProducts();
  }, [debouncedSearch, page]);

  const handleDelete = (patientId) => {
    setDeleteItem(patientId);
    showConfirmationDialog();
  };

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" variant="outlined">
          {success}
        </Alert>
      )}
      <ConfirmDialog
        open={isDialogOpen}
        onClose={hideConfirmationDialog}
        title="Are you sure you want to delete this product?"
        onConfirm={deleteProduct}
      />


      <SearchBar
        autoFocus
        style={{ marginBottom: '10px' }}
        placeholder="Search by product name..."
        value={searchQuery}
        onChange={(newValue) => {
          setSearchQuery(newValue);
        }}
        //onRequestSearch={() => fetchProducts()}
        onCancelSearch={() => {
          setSearchQuery('');
          fetchAndCacheProducts();
        }}
      />

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Generic Name</TableCell>
              <TableCell>Selling Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  {product.type === 'pharmaceutical' ? (
                    <TableCell>{product.customBrandName}</TableCell>
                  ) : (
                    <TableCell>
                      {product.productName + ' ' + product.packSize}
                    </TableCell>
                  )}
                  <TableCell>{product.genericName}</TableCell>
                  <TableCell>{product.sellingPrice}</TableCell>
                  <TableCell>{product.storeQuantity}</TableCell>

                  <TableCell align="center">
                    <Button onClick={() => editProduct(product)}>
                      <EditIcon />
                    </Button>
                    {/* <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      onClick={() => {
                        router.push(`/shops/${shopId}`);
                        setQuickSale(product);
                      }}
                    >
                      Sale
                    </Button> */}
                    <Button onClick={() => handleDelete(product._id)}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {loading ? "loading..." : "No data found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
            margin: '10px',
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={fetchPage}
            color="primary"
            shape="rounded"
          />
        </div>
      </TableContainer>
    </div>
  );
}

ProductsList.propTypes = {
  edit: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
};
