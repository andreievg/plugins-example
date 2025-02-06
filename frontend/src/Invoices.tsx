import React from 'react';
import { usePluginProvider } from './plugin';
import { Column } from './App';
export type InvoiceColumnData = { lineId: string; value: number };
export type Invoice = {
  id: string;
  type: 'Inbound' | 'Outbound';
  status: 'Draft' | 'Final';
  data: InvoiceColumnData[];
};

const Invoices = ({ invoices }: { invoices: Invoice[] }) => {
  const { plugins } = usePluginProvider();

  const columns: Column<InvoiceColumnData>[] = [
    { header: 'ID', Column: ({ row }) => <>{row.lineId}</> },
    { header: 'Value', Column: ({ row }) => <>{row.value}</> },
    ...(plugins.invoiceColumns?.columns || []),
  ];

  return (
    <div style={{ border: '1px', padding: '1px', borderStyle: 'solid' }}>
      Invoices:
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          <div>
            id: {invoice.id} type: {invoice.type}
          </div>
          {plugins.invoice?.map((InvoicePlugin, index) => (
            <InvoicePlugin key={index} invoice={invoice} />
          ))}
          {plugins.invoiceColumns?.StateLoader?.map((StateLoader, index) => (
            <StateLoader key={index} invoice={invoice} />
          ))}
          <table>
            <thead>
              <tr>
                {columns.map(({ header }) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.data.map((row) => (
                <tr key={row.lineId}>
                  {columns.map(({ Column, header }) => (
                    <td key={header}>
                      <Column row={row} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Invoices;
