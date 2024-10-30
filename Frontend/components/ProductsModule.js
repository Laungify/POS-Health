/* eslint-disable no-underscore-dangle */
import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import CreateProduct from './ProductsModules/CreateProduct';
import ProductsList from './ProductsModules/ProductsList';
import EditProduct from './ProductsModules/EditProduct';
import ProductsListFull from './ProductsModules/ProductsListFull';

export default function ProductsModule({ page }) {
  const [currentProduct, setCurrentProduct] = React.useState({});

  const [formState, setFormState] = React.useState('list');

  const edit = (product) => {
    setCurrentProduct(product);
    setFormState('edit');
  };

  return (
    <div>
      <Grid container justifyContent="flex-end">
        <Box my={1}>
          {formState === 'list' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setFormState('create')}
            >
              New Product
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && <CreateProduct setFormState={setFormState} />}

      {formState === 'edit' && (
        <EditProduct product={currentProduct} setFormState={setFormState} />
      )}

      {formState === 'list' &&
        (page === 'index' ? (
          <ProductsList edit={edit} formState={formState} />
        ) : (
          <ProductsListFull edit={edit} formState={formState} />
        ))}
    </div>
  );
}

ProductsModule.propTypes = {
  page: PropTypes.string.isRequired,
};
