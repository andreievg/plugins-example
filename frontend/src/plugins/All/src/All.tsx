import React from 'react';
import { AllPlugins } from 'src/plugin';

const All: AllPlugins = {
  Component: () => <></>,
  AllComponents: {
    Invoice: ({ data: { invoiceNode } }) => <div>status: {invoiceNode.status} yow</div>,
    columns: {
      invoice: {
        Loader: () => <>hi</>,
        columns: [{ key: 'something' }],
      },
    },
  },
  pluginType: 'All',
  name: 'DoItAll',
};

export default All;
