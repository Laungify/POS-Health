/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import {
  TextField,
  Button,
  Grid,
  Card,
  MenuItem,
  TextareaAutosize,
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import React from 'react'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useCurrentShopState from '../../stores/currentShop'
import useAuthState from '../../stores/auth'
import useSnackbarState from '../../stores/snackbar'

export default function EditProduct({ product, setFormState }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { open } = useSnackbarState()

  const [productId] = React.useState(product._id)
  const [productName, setProductName] = React.useState(product.productName)
  const [formulation, setFormulation] = React.useState(product.formulation)
  const [strength, setStrength] = React.useState(product.strength)
  const [packSize, setPackSize] = React.useState(product.packSize)
  const [genericName, setGenericName] = React.useState(product.genericName)
  const [costPrice, setCostPrice] = React.useState(product.costPrice)
  const [sellingPrice, setSellingPrice] = React.useState(product.sellingPrice)
  const [supplier, setSupplier] = React.useState(product.supplier)
  const [expiry, setExpiry] = React.useState(
    format(new Date(product.expiry), 'yyyy-MM-dd'),
  )
  const [batchNumber, setBatchNumber] = React.useState(product.batchNumber)
  const [unit, setUnit] = React.useState(product.unit)
  const [category, setCategory] = React.useState(product.category)
  const [tags, setTags] = React.useState(product.tags)
  const [salesChannel, setSalesChannel] = React.useState(product.salesChannel)
  const [reorderLevel, setReorderLevel] = React.useState(product.reorderLevel)
  const [description, setDescription] = React.useState(product.description)
  const [vat, setVat] = React.useState(product.vat || '')
  const [selectedImage, setSelectedImage] = React.useState(
    product?.productImage || null,
  )

  const { getUserId } = useAuthState()

  const salesChannels = ['POS', 'Online Store']

  const categories = [
    'Antimicrobials',
    'Diabetics',
    'OTC',
    'Herbal',
    'Hypertensives',
    'Asthma',
    'Oncology',
    'Others',
  ]

  const handleChangeSalesChannel = event => {
    setSalesChannel(event.target.value)
  }

  const productTypes = ['pharmaceutical', 'non-pharmaceutical']

  const [productType, setProductType] = React.useState(
    product?.type || 'pharmaceutical',
  )

  const handleChangeProductType = event => {
    setProductType(event.target.value)
  }

  const [loading, setLoading] = React.useState(false)

  const [imageUploaded, setImageUploaded] = React.useState(false)

  const editProduct = async e => {
    e.preventDefault()
    try {
      let updates = {}

      if (productType === 'pharmaceutical') {
        updates = {
          productName,
          formulation,
          strength,
          packSize,
          genericName,
          costPrice,
          sellingPrice,
          supplier,
          expiry,
          batchNumber,
          unit,
          category,
          tags,
          salesChannel,
          reorderLevel,
          description,
          productType,
          shopId,
          staffId: getUserId(),
          vat,
        }
        if (
          !productName ||
          !formulation ||
          !strength ||
          !packSize ||
          !genericName ||
          !costPrice ||
          !sellingPrice ||
          //! supplier ||
          //! expiry ||
          //! batchNumber ||
          !unit ||
          //! category ||
          !salesChannel ||
          !reorderLevel ||
          !shopId
        ) {
          open('error', 'All fields are required')
        }
      } else {
        updates = {
          productName,
          formulation: 'not applicable',
          strength: 'not applicable',
          genericName: 'not applicable',
          packSize,
          costPrice,
          sellingPrice,
          supplier,
          expiry,
          batchNumber,
          unit,
          category,
          tags,
          salesChannel,
          reorderLevel,
          description,
          productType,
          shopId,
          staffId: getUserId(),
          vat,
        }
        if (
          !productName ||
          !packSize ||
          !costPrice ||
          !sellingPrice ||
          //! supplier ||
          //! expiry ||
          //! batchNumber ||
          !unit ||
          //! category ||
          !salesChannel ||
          !reorderLevel ||
          !shopId
        ) {
          open('error', 'All fields are required')
        }
      }
      setLoading(true)

      const formData = new FormData()

      if (imageUploaded && selectedImage) {
        formData.append('file', selectedImage)
      }

      Object.keys(updates).forEach(key => {
        formData.append(key, updates[key])
      })

      await API.patch(`products/${productId}`, formData)
      setLoading(false)
      setFormState('list')
      open('success', 'product edited')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const handleVatChange = e => {
    const inputValue = e.target.value

    if (inputValue === '' || (inputValue >= 0 && inputValue <= 100)) {
      // Ensure the value is between 0 and 100 (0% to 100%)
      setVat(inputValue)
    }
  }

  return (
    <div>
      <h2>Edit Product</h2>

      {productType === 'pharmaceutical' && (
        <form encType="multipart/form-data" onSubmit={editProduct}>
          <Card style={{ padding: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedImage && (
                  <div>
                    <p>Product Image:</p>
                    <img
                      src={
                        imageUploaded
                          ? URL.createObjectURL(selectedImage)
                          : selectedImage
                      }
                      alt="Selected"
                      width="200"
                    />
                  </div>
                )}
                <input
                  name="file"
                  accept="image/*"
                  id="image-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => {
                    setSelectedImage(e.target.files[0])
                    setImageUploaded(true)
                  }}
                />
                <label htmlFor="image-input">
                  <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    component="span"
                  >
                    {selectedImage ? 'Change' : 'Upload'} Image
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Product type"
                  value={productType}
                  onChange={handleChangeProductType}
                  select
                >
                  {productTypes.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Product Name"
                  autoFocus
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Formulation"
                  value={formulation}
                  onChange={e => setFormulation(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Strength"
                  value={strength}
                  onChange={e => setStrength(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Pack Size"
                  value={packSize}
                  onChange={e => setPackSize(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Generic Name"
                  value={genericName}
                  onChange={e => setGenericName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Cost Price"
                  value={costPrice}
                  type="number"
                  onChange={e => setCostPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Selling Price"
                  value={sellingPrice}
                  type="number"
                  onChange={e => setSellingPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Supplier"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Expiry"
                  value={expiry}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={e => setExpiry(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Batch Number"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Unit"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  select
                >
                  {categories.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Tags"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                >
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Sales Channel"
                  value={salesChannel}
                  onChange={handleChangeSalesChannel}
                  select
                >
                  {salesChannels.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Reorder Level"
                  value={reorderLevel}
                  type="number"
                  onChange={e => setReorderLevel(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="VAT (%)"
                  value={vat}
                  type="number"
                  onChange={handleVatChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextareaAutosize
                  minRows={5}
                  placeholder="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </Grid>
            </Grid>
          </Card>
          <Grid
            container
            justifyContent="flex-end"
            spacing={2}
            style={{ marginTop: '10px' }}
          >
            <Grid item>
              <Button
                m="2"
                variant="contained"
                disableElevation
                onClick={() => setFormState('list')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={loading}
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      {productType === 'non-pharmaceutical' && (
        <form encType="multipart/form-data" onSubmit={editProduct}>
          <Card style={{ padding: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedImage && (
                  <div>
                    <p>Product Image:</p>
                    <img
                      src={
                        imageUploaded
                          ? URL.createObjectURL(selectedImage)
                          : selectedImage
                      }
                      alt="Selected"
                      width="200"
                    />
                  </div>
                )}
                <input
                  name="file"
                  accept="image/*"
                  id="image-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => {
                    setSelectedImage(e.target.files[0])
                    setImageUploaded(true)
                  }}
                />
                <label htmlFor="image-input">
                  <Button
                    disableElevation
                    variant="contained"
                    color="primary"
                    component="span"
                  >
                    {selectedImage ? 'Change' : 'Upload'} Image
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Product type"
                  value={productType}
                  onChange={handleChangeProductType}
                  select
                >
                  {productTypes.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Product Name"
                  autoFocus
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Pack Size"
                  value={packSize}
                  onChange={e => setPackSize(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Selling Price"
                  value={sellingPrice}
                  type="number"
                  onChange={e => setSellingPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Unit"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Cost Price"
                  value={costPrice}
                  type="number"
                  onChange={e => setCostPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Supplier"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Expiry"
                  value={expiry}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={e => setExpiry(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  // required
                  fullWidth
                  label="Batch Number"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  select
                >
                  {categories.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Tags"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                >
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Sales Channel"
                  value={salesChannel}
                  onChange={handleChangeSalesChannel}
                  select
                >
                  {salesChannels.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Reorder Level"
                  value={reorderLevel}
                  type="number"
                  onChange={e => setReorderLevel(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="VAT (%)"
                  value={vat}
                  type="number"
                  onChange={handleVatChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextareaAutosize
                  minRows={5}
                  placeholder="Description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </Grid>
            </Grid>
          </Card>
          <Grid
            container
            justifyContent="flex-end"
            spacing={2}
            style={{ marginTop: '10px' }}
          >
            <Grid item>
              <Button
                m="2"
                variant="contained"
                disableElevation
                onClick={() => setFormState('list')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={loading}
              >
                Edit
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </div>
  )
}

EditProduct.propTypes = {
  product: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
}
