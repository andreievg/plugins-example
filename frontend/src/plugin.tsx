import React, { useEffect } from 'react';
import { create } from 'zustand';
import { Invoice, InvoiceColumnData } from './Invoices';
import { Order } from './Orders';
import { mergeWith, isArray } from 'lodash';
import { Column } from './App';

// PLUGIN TYPES
export type Plugins = {
  invoice?: React.ComponentType<{ invoice: Invoice }>[];
  order?: React.ComponentType<{ order: Order }>[];
  invoiceColumns?: {
    StateLoader: React.ComponentType<{ invoice: Invoice }>[];
    columns: Column<InvoiceColumnData>[];
  };
};

// PLUGIN PROVIDER
type PluginProvider = {
  plugins: Plugins;
  addPlugins: (_: Plugins) => void;
};

export const usePluginProvider = create<PluginProvider>((set) => {
  return {
    plugins: {},
    addPlugins: (plugins) => {
      set((state) => {
        // Here can determine if version is suitable
        const newPlugins = mergeWith(state.plugins, plugins, (a, b) =>
          isArray(a) ? a.concat(b) : undefined
        );

        return { ...state, plugins: newPlugins };
      });
    },
  };
});

// PLUGINS INIT

// Used for local plugins in dev mode
declare const LOCAL_PLUGINS: { fileName: string }[];

export const useInitPlugins = () => {
  const { addPlugins } = usePluginProvider();

  const initRemotePlugins = async () => {
    const plugins = (await (await fetch('http://localhost:8080/plugin/list')).json()) as string[];

    for (const plugin of plugins) {
      let pluginBundle = await loadPlugin(plugin);
      addPlugins(pluginBundle);
    }
  };

  // For hot reloading in dev mode plugins will be loaded from ./plugin folder
  const initLocalPlugins = async () => {
    for (const plugin of LOCAL_PLUGINS) {
      let pluginBundle = await import(
        // Webpack will actually try to load everything in plugins directory
        // which causes issues
        /* webpackExclude: /node_modules/ */
        `./plugins/${plugin.fileName}/src/plugin.tsx`
      );
      addPlugins(pluginBundle.default);
    }
  };

  useEffect(() => {
    if (process.env['NODE_ENV'] === 'production') initRemotePlugins();
    else initLocalPlugins();
  }, []);
};

// LOAD REACT PLUGIN

// LOAD REMOTE PLUGIN
type Factory = Promise<() => { default: Plugins }>;

type Container = {
  get: (module: string) => Factory;
  init: (shareScope: unknown) => Promise<void>;
};

export const fetchPlugin = (plugin: string): Promise<Container> =>
  new Promise((resolve, reject) => {
    // We define a script tag to use the browser for fetching the plugin js file
    const script = document.createElement('script');
    script.src = `http://localhost:8080/plugin/${plugin}/${plugin}.js`;
    script.onerror = (err) => {
      const message = typeof err === 'string' ? err : 'unknown';
      reject(new Error(`Failed to fetch remote: ${plugin}. Error: ${message}`));
    };

    // When the script is loaded we need to resolve the promise back to Module Federation
    script.onload = () => {
      // The script is now loaded on window using the name defined within the remote
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(plugin);
      const container = window[plugin as any] as unknown as Container;
      if (!container) reject(new Error(`Failed to load plugin: ${plugin}`));

      const proxy = {
        get: async (request: string) => container.get(request),
        init: (scope: unknown) => container.init(scope),
      };
      resolve(proxy);
    };
    // Lastly we inject the script tag into the document's head to trigger the script load
    document.head.appendChild(script);
  });

/* eslint-disable camelcase */
declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: Record<string, unknown>;

export const loadPlugin = async (plugin: string): Promise<Plugins> => {
  try {
    // Check if this plugin has already been loaded
    if (!(plugin in window)) {
      // Initializes the shared scope. Fills it with known provided modules from this build and all remotes
      await __webpack_init_sharing__('default');
      // Fetch the plugin app
      const fetchedContainer = await fetchPlugin(plugin);
      // Initialize the plugin app
      await fetchedContainer.init(__webpack_share_scopes__['default']);
    }
    // `container` is the plugin app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = window[plugin as any] as unknown as Container;
    if (!container) throw new Error(`Failed to load plugin: ${plugin}`);

    // The module passed to get() must match the `exposes` item in our plugin app's webpack.config
    // this is always set as "plugin" in plugin's webpack
    const factory = await container.get('plugin');

    // `Module` is the React Component exported from the plugin
    const Module = factory?.();
    if (!Module?.default) throw new Error(`Failed to load plugin: ${plugin}`);

    return Module.default;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to load plugin');
  }
};

type PluginData<D> = { relatedRecordId: string; value: D };
export type PluginDataStore<T, D> = {
  data: PluginData<D>[];
  set: (data: PluginData<D>[]) => void;
  getById: (row: T) => PluginData<D> | undefined;
};
