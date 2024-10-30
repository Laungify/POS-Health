import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import StaffList from './StaffModules/StaffList';
import CreateStaff from './StaffModules/CreateStaff';
import EditStaff from './StaffModules/EditStaff';
import useAuthState from '../stores/auth';

export default function StaffModule({ shopId }) {
  const [currentStaff, setCurrentStaff] = React.useState({});

  const [formState, setFormState] = React.useState('list');

  const edit = (staff) => {
    setCurrentStaff(staff);
    setFormState('edit');
  };

  const { accountType } = useAuthState();
  return (
    <div>
      <Grid container justifyContent="flex-end">
        <Box my={1}>
          {formState === 'list' && accountType === 'company' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setFormState('create')}
            >
              New Staff
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && (
        <CreateStaff shopId={shopId} setFormState={setFormState} />
      )}

      {formState === 'edit' && (
        <EditStaff
          shopId={shopId}
          staff={currentStaff}
          setFormState={setFormState}
        />
      )}

      {formState === 'list' && (
        <StaffList shopId={shopId} edit={edit} formState={formState} />
      )}
    </div>
  );
}

StaffModule.propTypes = {
  shopId: PropTypes.string.isRequired,
};
