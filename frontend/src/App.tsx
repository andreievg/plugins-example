import React, { FC } from 'react';
import { useInitPlugins } from './plugin';
import Invoices from './Invoices';
import Orders from './Orders';

const App: FC = () => {
  useInitPlugins();
  return <Lists />;
};

export type Column<T> = {
  header: string;
  Column: React.ComponentType<{ row: T }>;
};
const Lists = () => (
  <>
    <Invoices
      invoices={[
        {
          id: 'one',
          type: 'Inbound',
          status: 'Draft',
          data: [
            {
              lineId: 'ten',
              value: 10,
            },
            {
              lineId: 'twenty',
              value: 20,
            },
          ],
        },
        {
          id: 'two',
          type: 'Outbound',
          status: 'Final',
          data: [
            {
              lineId: 'five',
              value: 5,
            },
            {
              lineId: 'two',
              value: 2,
            },
          ],
        },
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
