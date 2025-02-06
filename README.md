# plugins-example
React Remote Module Federation Plugins

# Summary

This repo includes a simple react front end host and rust back end. Back end serves remote plug in when placed in `backend/plugins` folder. 
Front end host will use any remote plugins that are served by backend and in development mode any local plugins that are in `frontend/src/plugins` folder (local plugins are hot reloadable)

To run backend `cargo run` from backend folder.

To run front end `yarn install && yarn start` from frontend folder.

To build and move First plugin to be served by backend `yarn install && yarn build && yarn copy` from `frontend/src/plugins/First` folder, similar with Second plugin. 
You don't need to build plugin for front end to use it in develop mode, and you will only need to `yarn install` in plugin folder if plugin adds a new dependency.

# Type Safe

Each plugin type has it's own type definition:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L9-L12
https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L14-L17

Plugin provider holds an array of plugin union types:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L19
https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L23

This adds type safety to plugin development (InvoicePlugin Component will have invoiceNode input, and pluginType would only be `InvoicePlugin`):

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugins/First/src/First.tsx#L4-L8

And pluginType that comes with plugin bundle, alongside getPlugins method that narrows down discriminated union, help to make sure correct input type is used when plugins are consumed:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L34-L40
https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/Invoices.tsx#L8-L9
https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/Invoices.tsx#L19

# Local Hot Reload vs Remote Module Federation

Hot reload is enabled by loading plugins from `frontend/src/plugins` folder in development mode using lazy import:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L62-L69

And LOGAL_PLUGINS are loaded in in webpack config:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/webpack.config.js#L16
https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/webpack.config.js#L98

This is different to remotely served built plugins using module federation. 
Those are loaded by first getting a list of plugins form the server then fetching them individually and binding to the application:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L53-L57

See [module federation dynamic remote example](https://github.com/module-federation/module-federation-examples/blob/5bfee6d5fdfb976e11b1f173e88875ac819467d7/advanced-api/dynamic-remotes/app1/src/App.js) for further explanation of how loadPlugin method works.

Plugins are stored in `zustand` store, which is populated on startup, when they need to be displayed they are loaded via React.lazy:

https://github.com/andreievg/plugins-example/blob/091f79a1289e4dd2bb6759f8efd160f00d924fb3/frontend/src/plugin.tsx#L88-L93

# Adding new plugins on demand

This repo is meant to shown an example of a pattern for plugins for your a web application. 
It's hard to know which areas will need to be extandable/pluggable in the future, if a simple pattern is available, it shoud be straight forward to extend application with a plugin wherer it's applicable.

[This diff shows the changes that are required to add a new plugin inteface](https://github.com/andreievg/plugins-example/compare/e50687be80a20a81e6012bd86554d9384d4e8bce..091f79a1289e4dd2bb6759f8efd160f00d924fb3)

[And this diff shows the changes required for adding plugin implementation](https://github.com/andreievg/plugins-example/compare/d009b355d5d4cfed18a858b393967a310fec8b47..e50687be80a20a81e6012bd86554d9384d4e8bce) 


