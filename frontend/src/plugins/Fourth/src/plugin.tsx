import React from 'react';
import { Plugins } from 'src/plugin';

const AnotherInvoiceStatus: Plugins = {
  invoice: [({ invoice }) => <div> Another invoice status: {invoice.status}</div>],
};

export default AnotherInvoiceStatus;
