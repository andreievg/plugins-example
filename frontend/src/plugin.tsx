import React, { Suspense, useEffect } from 'react';
import { create } from 'zustand';
import { Invoice } from './Invoices';

// PLUGIN TYPES
type CommonPluginProperties = { name: string };

export type InvoicesPlugin = {
  Component: React.ComponentType<{ data: { invoiceNode: Invoice } }>;
  pluginType: 'InvoicePlugin';
} & CommonPluginProperties;

type PluginType = InvoicesPlugin;

// PLUGIN PROVIDER
type PluginProvider = {
  plugins: PluginType[];
  addPlugin: (_: PluginType) => void;
  getPlugins: <PT extends PluginType['pluginType']>(
    pluginType: PT
  ) => Extract<PluginType, { pluginType: PT }>[];
};

export const usePluginProvider = create<PluginProvider>((set, get) => {
  return {
    plugins: [],
    addPlugin: (plugin: PluginType) => set(({ plugins }) => ({ plugins: [...plugins, plugin] })),
    getPlugins: <PT extends PluginType['pluginType']>(pluginType: PT) => {
      const plugins = get().plugins;
      return plugins.filter(
        (plugin): plugin is Extract<PluginType, { pluginType: PT }> =>
          plugin.pluginType === pluginType
      );
    },
  };
});

// PLUGINS INIT

// Used for local plugins in dev mode
declare const LOCAL_PLUGINS: { fileName: string }[];

export const useInitPlugins = () => {
  const { addPlugin } = usePluginProvider();

  const initRemotePlugins = async () => {
    const plugins = (await (await fetch('http://localhost:8080/plugin/list')).json()) as string[];

    for (const plugin of plugins) {
      loadPlugin(plugin).then(addPlugin);
    }
  };

  // For hot reloading in dev mode plugins will be loaded from ./plugin folder
  const initLocalPlugins = async () => {
    for (const plugin of LOCAL_PLUGINS) {
      import(
        // Webpack will actually try to load everything in plugins directory
        // which causes issues
        /* webpackExclude: /node_modules/ */
        `./plugins/${plugin.fileName}/src/${plugin.fileName}`
      ).then((plugin) => addPlugin(plugin.default));
    }
  };

  useEffect(() => {
    if (process.env['NODE_ENV'] === 'production') initRemotePlugins();
    else initLocalPlugins();
  }, []);
};

// LOAD REACT PLUGIN
type LoadReactPlugin = <I>(
  plugins: ({ Component: React.ComponentType<{ data: I }> } & CommonPluginProperties)[],
  input: I
) => React.JSX.Element;

export const loadReactPlugin: LoadReactPlugin = (plugins, input) => {
  return (
    <>
      {plugins.map(({ Component, name }) => {
        const ReactComponent = React.lazy(
          // Ract.lazy expect component as default export
          async () => ({
            default: Component,
          })
        );

        // Plugins should also have version, either checked here, in loadPlugin,
        // probably here with version passed on as paramter ? since version will be close to the area
        // where API for plugin is defiened ?
        return (
          <Suspense>
            <ReactComponent key={name} data={input} />
          </Suspense>
        );
      })}
    </>
  );
};

// LOAD REMOTE PLUGIN

//
type Factory = Promise<() => { default: PluginType }>;

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

export const loadPlugin = async (plugin: string): Promise<PluginType> => {
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
