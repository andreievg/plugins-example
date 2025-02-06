import React from 'react';
import { loadReactPlugin, usePluginProvider } from './plugin';
export type Invoice = { id: string; type: 'Inbound' | 'Outbound'; status: 'Draft' | 'Final' };

const Invoices = ({ invoices }: { invoices: Invoice[] }) => {
  const { getPlugins } = usePluginProvider();

  // Inputs for plugin here will be type safe
  const plugins = getPlugins('InvoicePlugin');
  const all = getPlugins('All');

  return (
    <div style={{ border: '1px', padding: '1px', borderStyle: 'solid' }}>
      Invoices:
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          <div>
            id: {invoice.id} type: {invoice.type}
          </div>
          {loadReactPlugin(plugins, { invoiceNode: invoice })}
          {all
            .map((p) => p.AllComponents.Invoice)
            .filter((c) => !!c)
            .map((Component) => Component && <Component data={{ invoiceNode: invoice }} />)}
          {all
            .map((p) => p.AllComponents.columns?.invoice?.Loader)
            .filter((c) => !!c)
            .map((Component) => Component && <Component data={{ invoiceNode: invoice }} />)}
          {all
            .map((p) => p.AllComponents.columns?.invoice?.columns)
            .filter((c) => !!c)
            .flat()
            .map((column) => (
              <div>{JSON.stringify(column)}</div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Invoices;
