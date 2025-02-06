import React from 'react';
import { InvoicesPlugin } from 'src/plugin';

const ShowInvoiceStatus: InvoicesPlugin = {
  Component: ({ data: { invoiceNode } }) => <div>status: {invoiceNode.status} yow</div>,
  pluginType: 'InvoicePlugin',
  name: 'ShowInvoiceStatus',
};

export default ShowInvoiceStatus;
