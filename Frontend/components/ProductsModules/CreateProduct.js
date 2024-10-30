/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import {
  TextField,
  Button,
  Grid,
  Card,
  MenuItem,
  Tabs,
  Tab,
} from '@material-ui/core'
import React from 'react'
import PropTypes from 'prop-types'
import Autocomplete from '@material-ui/lab/Autocomplete'
import API from '../../utils/api'
import useCurrentShopState from '../../stores/currentShop'
import useAuthState from '../../stores/auth'
import useSnackbarState from '../../stores/snackbar'

function SelectDrug({ setDrug, drug, setFormStep, setFormState }) {
  const [loading, setLoading] = React.useState(false)

  const [products, setProducts] = React.useState([])
  const [search, setSearch] = React.useState('')

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = React.useState(value)

    React.useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }

  const debouncedSearch = useDebounce(search, 500)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setProducts([])

      const result = await API.get(`/drugs?search=${search}`)

      const productsData = result.data

      setProducts(productsData)
      setLoading(false)
    }

    if (debouncedSearch) fetchData()
  }, [debouncedSearch])

  const onChangeDrug = item => {
    setDrug(item)
    setFormStep(2)
  }
  const otherDrug = () => {
    setDrug('')
    setFormStep(2)
  }

  return (
    <div>
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                disableClearable
                value={drug}
                options={products}
                getOptionLabel={option =>
                  option?.productTradeName &&
                    option?.apiStrengthPerDosage &&
                    option?.dosageFormName
                    ? `${option?.productTradeName?.toLowerCase()},
                   ${option?.apiStrengthPerDosage?.toLowerCase()},
                   ${option?.dosageFormName?.toLowerCase()}`
                    : option?.productTradeName
                      ? `${option?.productTradeName?.toLowerCase()}`
                      : ''
                }
                onChange={(event, newValue) => {
                  onChangeDrug(newValue)
                }}
                onInputChange={(event, newValue) => {
                  setSearch(newValue)
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Select drug"
                    variant="outlined"
                  />
                )}
              />
              {/* <input
                type="search"
                placeholder="search meds by brand name"
                style={{ width: "100%", height: "100%" }}
              onChange={(e) => setSearch(e.target.value)}
              /> */}
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              style={{ margin: 'auto', textAlign: 'center' }}
            >
              <Button
                m="2"
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => otherDrug()}
              >
                Other Drug
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      <Grid container justifyContent="flex-end" style={{ marginTop: '10px' }}>
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
      </Grid>
    </div>
  )
}

function AddProduct({ drug, setFormState, setFormStep }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { open } = useSnackbarState()

  const { getUserId } = useAuthState()

  const [productName, setProductName] = React.useState(
    drug.productTradeName || '',
  )
  const [formulation, setFormulation] = React.useState(
    drug.dosageFormName || '',
  )
  const [strength, setStrength] = React.useState(
    drug.apiStrengthPerDosage || '',
  )
  const [packSize, setPackSize] = React.useState('')
  const [genericName, setGenericName] = React.useState(drug.innOfApi || '')
  const [costPrice, setCostPrice] = React.useState(1)
  const [sellingPrice, setSellingPrice] = React.useState('')
  const [supplier, setSupplier] = React.useState(
    drug.localTechnicalRepresentative || '',
  )
  const [expiry, setExpiry] = React.useState('2025-10-03')
  const [batchNumber, setBatchNumber] = React.useState('')
  const [unit, setUnit] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [tags, setTags] = React.useState('')
  const [salesChannel, setSalesChannel] = React.useState('Online Store')
  const [reorderLevel, setReorderLevel] = React.useState(10)
  const [storeQuantity, setStoreQuantity] = React.useState(0)
  const [description, setDescription] = React.useState('')
  const [vat, setVat] = React.useState('')
  const [selectedImage, setSelectedImage] = React.useState(null)

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

  const [loading, setLoading] = React.useState(false)

  const [currentTab, setCurrentTab] = React.useState(0)

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const createPharmaceuticalProduct = async event => {
    event.preventDefault()
    const product = {
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
      shopId,
      storeQuantity,
      description,
      type: 'pharmaceutical',
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
      //!supplier ||
      !expiry ||
      //!batchNumber ||
      !unit ||
      //!category ||
      !salesChannel ||
      !reorderLevel ||
      !shopId
    ) {
      open('error', 'Missing required fields')
    } else {
      try {
        setLoading(true)

        const formData = new FormData()
        formData.append('file', selectedImage)

        Object.keys(product).forEach(key => {
          formData.append(key, product[key])
        })

        await API.post(`products`, formData)
        setLoading(false)
        setFormState('list')
        open('success', 'product created')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        open('error', message)
      }
    }
  }

  const createConsumableProduct = async event => {
    event.preventDefault()
    const product = {
      productName,
      formulation: 'not applicable',
      strength: 'not applicable',
      packSize,
      genericName: 'not applicable',
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
      shopId,
      storeQuantity,
      description,
      type: 'non-pharmaceutical',
      prescribed: false,
      staffId: getUserId(),
      vat,
    }
    if (
      !productName ||
      !packSize ||
      !costPrice ||
      !sellingPrice ||
      //!supplier ||
      !expiry ||
      //!batchNumber ||
      !unit ||
      //!category ||
      !salesChannel ||
      !reorderLevel ||
      !shopId
    ) {
      open('error', 'Missing required fields')
    } else {
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('file', selectedImage)

        Object.keys(product).forEach(key => {
          formData.append(key, product[key])
        })

        await API.post(`products`, formData)

        setLoading(false)
        setFormState('list')
        open('success', 'product created')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        open('error', message)
      }
    }
  }

  const goBack = () => {
    /* setDrug(""); */
    setFormStep(1)
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
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="on"
      >
        <Tab label="Pharmaceuticals" key="pharmaceuticals" />
        <Tab label="Non-pharmaceuticals" key="non-pharmaceuticals" />
      </Tabs>

      {currentTab === 0 && (
        <form
          encType="multipart/form-data"
          onSubmit={createPharmaceuticalProduct}
        >
          <Card style={{ padding: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedImage && (
                  <div>
                    <p>Selected Image:</p>
                    <img
                      src={URL.createObjectURL(selectedImage)}
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
                  onChange={e => setSelectedImage(e.target.files[0])}
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
                  label="Product Name"
                  autoFocus
                  value={productName}
                  disabled={!!drug}
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
                  required
                  fullWidth
                  label="Unit eg tablet, bottle"
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
                  label="Pack Size eg 1s, 10s, 30s, 70ml"
                  value={packSize}
                  onChange={e => setPackSize(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  //required
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
                  required
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
                  //required
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
                  onChange={e => setSalesChannel(e.target.value)}
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
                  label="Store Quantity"
                  value={storeQuantity}
                  type="number"
                  onChange={e => setStoreQuantity(e.target.value)}
                />
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
                <TextField
                  margin="normal"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                onClick={() => goBack()}
                disabled={loading}
              >
                Back
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
                Create
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      {currentTab === 1 && (
        <form encType="multipart/form-data" onSubmit={createConsumableProduct}>
          <Card style={{ padding: '10px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedImage && (
                  <div>
                    <p>Selected Image:</p>
                    <img
                      src={URL.createObjectURL(selectedImage)}
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
                  onChange={e => setSelectedImage(e.target.files[0])}
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
                  label="Product Name"
                  autoFocus
                  value={productName}
                  disabled={!!drug}
                  onChange={e => setProductName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Pack Size eg 1s, 10s, 30s, 70ml"
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
                  label="Unit eg tablet, bottle"
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
                  //required
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
                  required
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
                  //required
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
                  onChange={e => setSalesChannel(e.target.value)}
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
                  label="Store Quantity"
                  value={storeQuantity}
                  type="number"
                  onChange={e => setStoreQuantity(e.target.value)}
                />
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

              <Grid item xs={12}>
                <Grid xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
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
                  onClick={() => goBack()}
                  disabled={loading}
                >
                  Back
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
                  Create
                </Button>
              </Grid>
            </Grid>
          </Card>
        </form>
      )}
    </div>
  )
}

export default function CreateProduct({ setFormState }) {
  const [drug, setDrug] = React.useState('')
  const [formStep, setFormStep] = React.useState(1)

  return (
    <div>
      <h2>Create Product</h2>
      {formStep === 1 && (
        <SelectDrug
          setDrug={setDrug}
          drug={drug}
          setFormStep={setFormStep}
          setFormState={setFormState}
        />
      )}
      {formStep === 2 && (
        <AddProduct
          drug={drug}
          setFormState={setFormState}
          setFormStep={setFormStep}
        />
      )}
    </div>
  )
}

SelectDrug.propTypes = {
  setDrug: PropTypes.func.isRequired,
  drug: PropTypes.object.isRequired,
  setFormStep: PropTypes.func.isRequired,
  setFormState: PropTypes.func.isRequired,
}

AddProduct.propTypes = {
  drug: PropTypes.object.isRequired,
  setFormStep: PropTypes.func.isRequired,
  setFormState: PropTypes.func.isRequired,
}

CreateProduct.propTypes = {
  setFormState: PropTypes.func.isRequired,
}
