import React, { FC } from 'react';
import { useInitPlugins } from './plugin';
import Invoices from './Invoices';
import Orders from './Orders';

const App: FC = () => {
  useInitPlugins();
  return <Lists />;
};

const Lists = () => (
  <>
    <Invoices
      invoices={[
        { id: 'one', type: 'Inbound', status: 'Draft' },
        { id: 'two', type: 'Outbound', status: 'Final' },
      ]}
    />
    <Orders
      orders={[
        { id: 'one', type: 'Request', status: 'Draft' },
        { id: 'two', type: 'Response', status: 'Final' },
      ]}
    />
  </>
);

export default App;
