import React from 'react';
import { loadReactPlugin, usePluginProvider } from './plugin';
export type Order = { id: string; type: 'Request' | 'Response'; status: 'Draft' | 'Final' };

const Orders = ({ orders }: { orders: Order[] }) => {
  const { getPlugins } = usePluginProvider();

  // Inputs for plugin here will be type safe
  const plugins = getPlugins('OrderPlugin');

  return (
    <div style={{ border: '1px', padding: '1px', borderStyle: 'solid' }}>
      Orders:
      {orders.map((order) => (
        <div key={order.id}>
          <div>
            id: {order.id} type: {order.type}
          </div>
          {loadReactPlugin(plugins, { orderNode: order })}
        </div>
      ))}
    </div>
  );
};

export default Orders;
