import React from 'react';
import { usePluginProvider } from './plugin';
export type Order = { id: string; type: 'Request' | 'Response'; status: 'Draft' | 'Final' };

const Orders = ({ orders }: { orders: Order[] }) => {
  const { plugins } = usePluginProvider();

  return (
    <div style={{ border: '1px', padding: '1px', borderStyle: 'solid' }}>
      Orders:
      {orders.map((order) => (
        <div key={order.id}>
          <div>
            id: {order.id} type: {order.type}
          </div>
          {plugins.order?.map((OrderPlugin, index) => <OrderPlugin key={index} order={order} />)}
        </div>
      ))}
    </div>
  );
};

export default Orders;
