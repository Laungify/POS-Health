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
  Grid,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Alert } from '@material-ui/lab';
import SearchBar from 'material-ui-search-bar';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useConfirmationDialog from '../../hooks/useConfirmationDialog';
import ConfirmDialog from '../custom/ConfirmDialog';
import useCurrentShopState from '../../stores/currentShop';
import useQuickSaleState from '../../stores/quickSale';
import { addData, getAllData, openIndexedDB, getDataById, clearData } from '../../utils/indexDBUtils';
import fetchDataAndCache from '../../utils/fetchDataAndCache'
import indexDBDexi from '../../utils/dexiIndexDB';



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

export default function ProductsList({ edit }) {
  const classes = useStyles();

  const { setQuickSale } = useQuickSaleState();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const { isDialogOpen, showConfirmationDialog, hideConfirmationDialog } =
    useConfirmationDialog();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMounted = React.useRef(false);

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



  // async function fetchProducts() {
  //   try {
  //     setLoading(true);
  //     setError('');
  //     setSuccess('');

  //     console.log('Fetching all products from server...');

  //     // Fetch products from the API
  //     const result = await API.get(`shops/${shopId}/products/?page=${page}&search=${searchQuery}`);
  //     console.log('Server response received:', result.data);

  //     const productsData = result.data.data;

  //     // Initialize IndexedDB
  //     const db = await openIndexedDB('localdb', 1, [
  //       { name: 'products', keyPath: 'id', autoIncrement: false },
  //     ]);

  //     console.log('IndexedDB initialized');

  //     await clearData(db, 'products');

  //     for (const product of productsData) {
  //       await addData(db, 'products', product);
  //     }

  //     console.log('Products cached in IndexedDB', productsData);

  //     // Update state with the fetched products
  //     setProducts(productsData);
  //     setTotalPages(result.data.paging.pages);
  //     setLoading(false);

  //   } catch (err) {

  //     // Fallback to IndexedDB if API fails
  //     try {
  //       const db = await openIndexedDB('localdb', 1, [
  //         { name: 'products', keyPath: 'id', autoIncrement: false },
  //       ]);
  //       const cachedProducts = await getAllData(db, 'products');
  //       if (cachedProducts.length > 0) {
  //         setProducts(cachedProducts);
  //       }
  //     } catch (fallbackError) {
  //       console.error('Error fetching products from IndexedDB:', fallbackError);
  //     }
  //   }
  // }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Fetching all products from server...');

      // Fetch products from the API with search query
      const result = await API.get(`shops/${shopId}/products?page=${page}&search=${searchQuery}`);
      const productsData = result.data.data;

      console.log('Server response received:', productsData);

      // Initialize IndexedDB
      const db = await openIndexedDB('localdb', 1, [
        { name: 'products', keyPath: 'id', autoIncrement: false },
      ]);

      console.log('IndexedDB initialized');

      // Clear existing data and cache new data
      await clearData(db, 'products');
      for (const product of productsData) {
        await addData(db, 'products', product);
      }

      console.log('Products cached in IndexedDB', productsData);

      // Update state with the fetched products
      setProducts(productsData);
      setTotalPages(result.data.paging.pages);
    } catch (err) {
      console.error('Error fetching from API:', err.message || err);

      // Fallback to IndexedDB if API fails
      try {
        console.log('Fetching products from IndexedDB...');
        const db = await openIndexedDB('localdb', 1, [
          { name: 'products', keyPath: 'id', autoIncrement: false },
        ]);
        const cachedProducts = await getAllData(db, 'products');
        if (cachedProducts.length > 0) {
          const filteredCachedProducts = searchQuery
            ? cachedProducts.filter(product => {
              const regexPattern = new RegExp(searchQuery, 'i');
              return (
                product.productName.match(regexPattern) ||
                product.genericName.match(regexPattern)
              );
            })
            : cachedProducts;

          setProducts(filteredCachedProducts);
        } else {
          setError('No products found in cache');
        }
      } catch (fallbackError) {
        console.error('Error fetching products from IndexedDB:', fallbackError);
        setError('Failed to fetch products from both server and cache');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }


  // Step 2: Search products from IndexedDB based on debounced query
  async function searchProducts() {
    if (!debouncedSearch) {
      fetchProducts();
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

  const [staffPatients, setStaffPatients] = React.useState([])
  const fetchStaffPatients = async () => {
    try {
      const results = await API.get(`shops/${shopId}/patients`);

      const patients = results.data.data;

      const flatPatients = Array.isArray(patients[0]) ? patients.flat() : patients;

      await indexDBDexi.patients.clear();
      await indexDBDexi.patients.add(flatPatients);

      setStaffPatients(flatPatients);

    } catch (apiError) {

      try {
        let cachedPatients = await indexDBDexi.patients.toArray();

        if (Array.isArray(cachedPatients) && cachedPatients.length > 0 && Array.isArray(cachedPatients[0])) {
          cachedPatients = cachedPatients.flat();
        }

        if (cachedPatients.length > 0) {
          setStaffPatients(cachedPatients);
        } else {
          setError('No patients found in cache');
        }
      } catch (fallbackError) {
        console.error('Error fetching patients from IndexedDB:', fallbackError);
        setError('Failed to fetch patients from server and cache');
      }
    }
  };

  const [deleteItem, setDeleteItem] = useState(null);
  const deleteProduct = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await API.delete(`products/${deleteItem}`);
      setSuccess('Successfully deleted product');
      // fetchAndCacheProducts();
      fetchProducts();
      setDeleteItem(null);
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
      setLoading(false);
      setDeleteItem(null);
    }
  };

  async function clearSearch() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const result = await API.get(`shops/${shopId}/products?page=${page}`);

      const productsData = result.data.data;
      const { paging } = result.data;

      setProducts(productsData);
      setTotalPages(paging.pages);
      setLoading(false);
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
      setLoading(false);
    }
  }


  const editProduct = (product) => {
    edit(product);
  };


  const fetchPage = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    fetchProducts();
  }, [shopId, limit]);

  // useEffect(() => {
  //   console.log('Products list updated😂😂😂😂', products);
  // }, [products]);

  useEffect(() => {
    searchProducts();
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchStaffPatients();
  }, [shopId]);

  useEffect(() => {
    console.log('persisted patients,🔥🔥🔥🔥', staffPatients);
  }, [staffPatients]);


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
          // fetchAndCacheProducts();
          clearSearch();
        }}
      />
      {/* {products.length > 0} // to list prods on home */}
      {searchQuery ? (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Product Names</TableCell>
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
                        {`${product.productName} ${product.packSize}`}
                      </TableCell>
                    )}
                    <TableCell>{product.genericName}</TableCell>
                    <TableCell>{product.sellingPrice}</TableCell>
                    <TableCell>{product.storeQuantity}</TableCell>
                    <TableCell align="center">
                      <Button onClick={() => editProduct(product)}>
                        <EditIcon />
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => setQuickSale(product)}
                      >
                        Sale
                      </Button>
                      {/* <Button onClick={() => handleDelete(product._id)}>
                        <DeleteIcon />
                      </Button> */}
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
      ) : (
        <Grid container justifyContent="center">
          <Grid item style={{ marginTop: '10px' }}>
            Search for products..
          </Grid>
        </Grid>
      )}
    </div>
  );
}

ProductsList.propTypes = {
  edit: PropTypes.func.isRequired,
};
