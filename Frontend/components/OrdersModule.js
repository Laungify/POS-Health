import React from 'react';
import OrdersList from './OrdersModules/OrdersList';
import ViewOrder from './OrdersModules/ViewOrder';
import CreateSale from './OrdersModules/CreateSale';

export default function OrdersModule() {
  const [currentOrder, setCurrentOrder] = React.useState({});
  const [currentSale, setCurrentSale] = React.useState({});

  const [formState, setFormState] = React.useState('list');

  const view = (order) => {
    setCurrentOrder(order);
    setFormState('view');
  };

  const newSale = (sale) => {
    setCurrentSale(sale);
    setFormState('sale');
  };

  return (
    <div>
      {formState === 'view' && (
        <ViewOrder
          order={currentOrder}
          setFormState={setFormState}
          newSale={newSale}
        />
      )}

      {formState === 'list' && <OrdersList view={view} formState={formState} />}

      {formState === 'sale' && (
        <CreateSale
          orderSale={currentSale}
          setFormState={setFormState}
          order={currentOrder}
        />
      )}
    </div>
  );
}
