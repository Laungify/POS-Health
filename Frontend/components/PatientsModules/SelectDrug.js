/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import { TextField, Button, Grid, Card, Autocomplete } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';

export default function SelectDrug({ setDrug, drug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drugs, setDrugs] = useState([]);

  const onChangeDrug = (data) => {
    setDrug(data);
    /* setFormStep(2); */
  };

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const results = await API.get(`drugs`);

      const drugsData = results.data;

      setDrugs(drugsData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  React.useEffect(() => {
    fetchDrugs();
  }, []);

  const otherDrug = () => {
    setDrug('');
    /*   setFormStep(2); */
  };

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <Card body="true" style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                disableClearable
                value={drug}
                options={drugs}
                getOptionLabel={(option) =>
                  option?.productTradeName?.toLowerCase() || ''
                }
                onChange={(event, newValue) => {
                  onChangeDrug(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select drug"
                    variant="outlined"
                  />
                )}
              />
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

      {/* <Grid container justifyContent="flex-end" style={{ marginTop: '10px' }}>
        <Grid item>
          <Button m="2" variant="contained" disableElevation disabled={loading}>
            Cancel
          </Button>
        </Grid>
      </Grid> */}
    </div>
  );
}

SelectDrug.propTypes = {
  setDrug: PropTypes.func.isRequired,
  drug: PropTypes.object.isRequired,
};
