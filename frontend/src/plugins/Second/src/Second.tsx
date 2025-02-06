import React from 'react';
import { OrderPlugin } from 'src/plugin';

const ShowOrderButton: OrderPlugin = {
  Component: {
    one: ({ data: { orderNode } }) => (
      <button type="button" onClick={() => alert(JSON.stringify(orderNode, null, ' '))}>
        Shows
      </button>
    ),
  },
  pluginType: 'OrderPlugin',
  name: 'ShowOrderButton',
};

export default ShowOrderButton;
