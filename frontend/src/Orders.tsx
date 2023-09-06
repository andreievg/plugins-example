import React from 'react';
type Order = { id: string; type: 'Request' | 'Response'; status: 'Draft' | 'Final' };

const Orders = ({ orders }: { orders: Order[] }) => {
  return (
    <div style={{ border: '1px', padding: '1px', borderStyle: 'solid' }}>
      Orders:
      {orders.map((order) => (
        <div key={order.id}>
          <div>
            id: {order.id} type: {order.type}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
