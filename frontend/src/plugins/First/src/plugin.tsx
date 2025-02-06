import React from 'react';
import { Plugins } from 'src/plugin';

const ShowInvoiceStatus: Plugins = {
  invoice: [({ invoice }) => <div>status: {invoice.status}</div>],
};

export default ShowInvoiceStatus;
