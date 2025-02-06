import React, { useEffect } from 'react';
import { Invoice, InvoiceColumnData } from 'src/Invoices';
import { PluginDataStore, Plugins } from 'src/plugin';
import { create } from 'zustand';

const useColumnStore = create<PluginDataStore<InvoiceColumnData, string>>((set, get) => ({
  data: [],
  set: (data) => set((state) => ({ ...state, data })),
  getById: (row) => get().data.find(({ relatedRecordId }) => relatedRecordId == row.lineId),
}));

const useGetData = ({ data: _can_be_used_in_api_query }: Invoice) => {
  const { set } = useColumnStore();
  useEffect(() => {
    setTimeout(
      () =>
        set([
          {
            relatedRecordId: 'ten',
            value: 'Its ten',
          },
        ]),
      2000
    );
  }, []);
};

const InvoiceLines: Plugins = {
  invoiceColumns: {
    StateLoader: [
      ({ invoice }) => {
        useGetData(invoice);
        return <></>;
      },
    ],
    columns: [
      {
        header: 'Check',
        Column: ({ row }) => {
          const { getById } = useColumnStore();
          return <>{getById(row)?.value ?? ''}</>;
        },
      },
    ],
  },
};

export default InvoiceLines;
