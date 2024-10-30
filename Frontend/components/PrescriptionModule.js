import React from 'react';
import PropTypes from 'prop-types';
import PrescriptionsList from './PrescriptionsModules/PrescriptionsList';
import ViewPrescription from './PrescriptionsModules/ViewPrescription';

export default function PrescriptionsModule() {
  const [currentPrescription, setCurrentPrescription] = React.useState({});
  const [formState, setFormState] = React.useState('list');

  const view = (prescription) => {
    setCurrentPrescription(prescription);
    setFormState('view');
  };

  return (
    <div>
      {formState === 'view' && (
        <ViewPrescription
          prescription={currentPrescription}
          setFormState={setFormState}
        />
      )}

      {formState === 'list' && (
        <PrescriptionsList view={view} formState={formState} />
      )}
    </div>
  );
}
