import React, { useEffect } from 'react';
import { Invoice, InvoiceColumnData } from 'src/Invoices';
import { PluginDataStore, Plugins } from 'src/plugin';
import { create } from 'zustand';

const useColumnStore = create<PluginDataStore<InvoiceColumnData, { russian: string; hex: string }>>(
  (set, get) => ({
    data: [],
    set: (data) => set((state) => ({ ...state, data })),
    getById: (row) => get().data.find(({ relatedRecordId }) => relatedRecordId == row.lineId),
  })
);

const useGetData = ({ data: _can_be_used_in_api_query }: Invoice) => {
  const { set } = useColumnStore();
  useEffect(() => {
    setTimeout(
      () =>
        set([
          {
            relatedRecordId: 'ten',
            value: { russian: 'desiat', hex: '10' },
          },
        ]),
      1000
    );
  }, []);
};

const AnotherTwoColumnInInvoiceAndStatus: Plugins = {
  invoice: [({ invoice }) => <div>From third plugin status: {invoice.status}</div>],
  invoiceColumns: {
    StateLoader: [
      ({ invoice }) => {
        useGetData(invoice);
        return <></>;
      },
    ],
    columns: [
      {
        header: 'Russian',
        Column: ({ row }) => {
          const { getById } = useColumnStore();
          return <>{getById(row)?.value.russian ?? ''}</>;
        },
      },
      {
        header: 'Hex',
        Column: ({ row }) => {
          const { getById } = useColumnStore();
          return <>{getById(row)?.value.hex ?? ''}</>;
        },
      },
    ],
  },
};

export default AnotherTwoColumnInInvoiceAndStatus;
