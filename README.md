![Dashboard and Platform bible integration strategy4-Paranext for translators w_ AQua drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/2055e3f0-efa8-437c-8bf8-df3bf6a4b70c)![Dashboard and Platform bible integration strategy4-Paranext for translators w_ AQua drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/26b8ba4c-2de3-472b-8273-bae99b12e236)# paranext-extension-dashboard

An architectural pattern with reusable components and tools for building Paranext extensions that can run in both Paranext and Dashboard as well as browser-based web applications.

Initial domain-specific components include those for both AQuA and Dashboard Tokenized Text, bringing AQuA's analysis, and Dashboard's Tokenized Corpora views, to Paranext, Dashboard, and the web through the same, reusable components.  

## Terminology

The following terms are used in this document to disambiguate different deployment scenarios for components:

- **BrowserApps**
  - **ParanextWebviewExtensions**
  - **SPA**  - single page web applications like AQuA's web portal
- **ParanextExtensionHostComponents**
  - **ParanextCommandExtensions** - when configured to run in ParanextExtensionHost process
  - **ParanextDataEngineExtensions** - when configured to run in ParanextExtensionHost process

## Directory structure

### Components and Naming Patterns

- `extension-host` _(For **ParanextExtensionHostComponents**)_
  - `services`
    - `services/extension-storage.persist.service` _(For **ParanextExtensionHostComponents**: exposes `papi.backend.storage` as `IPersist` to support
    service persistence (e.g. caching) when exposed as **ParanextCommandExtensions** or **ParanextDataEngineExtensions**)_ 
  - `extension-host/utils`
    - `utils/http.papiback.requester.util` _(For **ParanextExtensionHostComponents**: implements `Requester` using `papi.backend`)_
  - `aqua-dataproviderengine` _(For **ParanextDataEngineExtension**: makes `aqua.service` functionality available to other **ParanextWebviewExtensions** and **ParanextExtensionHostComponents** as a Paranext `DataProviderEngine`. Uses `extension-storagepersist.service` to persist in Paranext Extension Host's-preferred way.)_
- `renderer`  _(For **BrowserApps**)_
  - `renderer/services`
    - `renderer/services/indexeddb-persist-service` _(For **SPA**: implements `IPersist` for web applications)_
  - `renderer/utils`  
    - `renderer/utils/http.browser.requester.util`  _(For **SPA**: implements `Requester` for web applications)_
    - `renderer/utils/http.papifront.requester.util`  _(For **ParanextWebviewExtensions**: implements `Requester` using `papi.frontend`)_
    - `renderer/utils/async-task.util`  _(For **SPA**: Implements `IAsyncTask`. Should work for both **SPA** and **ParanextWebviewExtensions**, although paranext work would ideally be delegated to a separate **ParanextCommandExtension** or **ParanextDataEngineExtension** that runs in paranext's Extension Host process that can be shared with other extensions)_
  - `renderer/*.[data type].datacontext.tsx` _(makes data types available to child React components through a `renderer/[data type].context`.)_
  - `renderer/[data type].context.ts` _(makes the data types available to child components as a React context.)_
  - `renderer/*.[data type].component.tsx` _(a child component that consumes data type, provided to it through a `renderer/[data type].context` by a parent `renderer/*.[data type].datacontext.tsx`)_
  - `renderer/*.web-view.tsx` _(the base parent React component for paranext webview extensions)_
  - `renderer/*.component.tsx` _(a reusable React component. Data to this component is provided through params and not context, making such components not dependent on any `renderer/*.[data type].datacontext.tsx`)_
- `shared` _(for both **BrowserApps** and **ParanextExtensionHost** extensions)_
  - `services`
    - `shared/services/aqua.service` _(service interface for AQuA, which uses an implementation of `Requester` to make requests to AQuA's endpoints and `IPersist` to support persistent caching through `cache.service`)_
      - `shared/services/cache.service` _(provides caching for services. Uses an implementation of `IPersist` for persistent storage)_
  - `services/utils`
    - `shared//services/async-lock.util` _(a JS promise-based non-blocking lock for synchronizing in-process async operations, e.g. syncing `aqua.service` remote and cache updates, and `cache.service` updates to shared map and `IPersist`)_
    - `array-manipulations.util` _(utilities for processing arrays, e.g. `groupBy()`)_

### Top level

This repository is structured as specified by Paranext:

- `package.json` contains information about this extension's npm package. It is required for Paranext to use the extension properly. It is copied into the build folder
- `src` contains the source code for the extension
  - `src/main.ts` is the main entry file for the extension
  - `src/types/paranext-extension-dashboard.d.ts` is this extension's types file that defines how other extensions can use this extension through the `papi`. It is copied into the build folder
  - `*.web-view.tsx` files will be treated as React WebViews
  - `*.web-view.html` files are a conventional way to provide HTML WebViews (no special functionality)
- `public` contains static files that are copied into the build folder
  - `public/manifest.json` is the manifest file that defines the extension and important properties for Paranext
  - `public/package.json` defines the npm package for this extension and is required for Paranext to use it appropriately
  - `public/assets` contains asset files the extension and its WebViews can retrieve using the `papi-extension:` protocol
- `dist` is a generated folder containing your built extension files
- `release` is a generated folder containing a zip of your built extension files

## Assembling components 

### Paranext

#### Example - AQuA for Translators

The following assembly of components results in an AQuA histogram webview that caches data for offline use and displays assessment results centered on the current Paranext verse:

- `verseaware.web-view.tsx` - connects to Paranext (and Dashboard) verse change events and configures the child context environment to use `httpPapiFrontRequester` as the network `Requester`, `AsyncTask` (uses WebWorkers) for async processing of long tasks, and `extension-storage.persist.service` for caching data to disk using `Papi.backent` (Paranext Extension Host's) `storage` service. 
  - `componentlist.component.tsx` to display more than one web view in rows, and add, remove, and reorder web views (much like Dashboard's Enhanced View).
    - `aqua.namedpairs.datacontext.tsx` to use `aqua.service` to obtain data from AQuA's machine learning endpoints using the requester provided by the parent environment (`httpPapiFrontRequester`), cache and persist it, the latter using `IPersist` provided by the parent environment (`extension-storage.persist.service`), and make it available to child components as `NamedPairs[]`. Note that this is the only AQuA specific component in this deployment scenario.
      - `charts.namedpairs.component.tsx` to display `NamedPairs[]` using an aggregate of a charting library and `dualslider.component.tsx` to filter data ranges.

![Dashboard and Platform bible integration strategy4-Paranext for translators w_ AQua drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/721bce23-4fc1-4659-92cb-d5f2d2c4a73b)

#### Example - AQuA in Translation Consultant configuration

![Dashboard and Platform bible integration strategy4-Paranext For TCs drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/2a01236a-9e65-4b58-8419-09f64dfbe432)

### Dashboard

#### Example - Dashboard

Exactly the same as for 'Example - AQuA, with `dashboard-integration.web-view.tsx` used by a headless browser in Dashboard to provide PAPI access to Dashboard api services.


### Web 

As a part of a single page app web portal that directly interacts with AQuA's machine learning endpoints using the browser's native `fetch` through `httpBrowserRequester` and persists data to the browser's native IndexedDb through `indexeddb.persist.service`. _Notice that components under `portal.tsx` are exactly the same as for Paranext and Dashboard deployement scenarios for the portal's 'histogram' charting of Results portion of overall functionality, except the developer chose to remove `componentlist.component.tsx` since a display in rows was not desired.

- `index.html` - bootstraps React, loading:
  - `portal.tsx` - configures the child context environment to use `httpBrowserRequester` as the network `Requester`, `AsyncTask` (uses WebWorkers)for async processing of long tasks, and `indexeddb.persist.service` for caching data using the browser's built-in data storage facility (IndexedDB).
    - `aqua.namedpairs.datacontext.tsx` to use `aqua.service` to obtain data from AQuA's endpoints using the requester provided by the parent environment (`httpPapiFrontRequester`), cache and persist it, the latter using `IPersist` provided by the parent environment (`extension-storage.persist.service`), and make it available to child components as `NamedPairs[]`. Note that this is the only AQuA specific component in this deployment scenario.
      - `charts.namedpairs.component.tsx` to display `NamedPairs[]` using an aggregate of a charting library and `dualslider.component.tsx` to filter data ranges.

## To install

  ### Paranext

  #### Development

1. Clone [`this repository](https://github.com/russellmorley/paranext-extension-dashboard)
2. Run `npm install`
3. Clone to sibling directory [`PAPI Core`](https://github.com/paranext/paranext-core), 
4. follow (instructions in readme)[https://github.com/paranext/paranext-core?tab=readme-ov-file#developer-install], including
running `npm install`.

  #### To package for production

To package your extension into a zip file for distribution:

`npm run package`

  ### Dashboard

  #### Development

1. Clone and build [`Dashboard, Paranext Branch`](https://github.com/Clear-Bible/ClearDashboard/tree/paranext)
2. Clone [`this repository](https://github.com/russellmorley/paranext-extension-dashboard)
3. Run `npm install`
4. Clone to sibling directory [`PAPI Core (standalone), Dashboard Branch`](https://github.com/russellmorley/paranext-core/tree/dashboard), 
5. follow (instructions at)[https://github.com/paranext/paranext-core?tab=readme-ov-file#developer-install], including
running `npm install`.

  ### Browser Apps

(Dependent on packaging and deployment approach)

## To run in development

  ### Dashboard

1. Execute `npm run start:PAPI-standalone` in the base directory in which you installed this repository from a command shell.
2. Execute Dashboard from Visual Studio.

  ### Paranext

Execute `npm start` in the base directory in which you installed this repository from a command shell.

  ### Browser Apps

(Dependent on packaging and deployment approach)

## Notes about Paranext Webviews

This template has special features and specific configuration to make building an extension for Paranext easier. Following are a few important notes:

### React WebView files - `.web-view.tsx`

Paranext WebViews must be treated differently than other code, so this template makes doing that simpler:

- WebView code must be bundled and can only import specific packages provided by Paranext (see `externals` in `webpack.config.base.ts`), so this template bundles React WebViews before bundling the main extension file to support this requirement. The template discovers and bundles files that end with `.web-view.tsx` in this way.
  - Note: while watching for changes, if you add a new `.web-view.tsx` file, you must either restart webpack or make a nominal change and save in an existing `.web-view.tsx` file for webpack to discover and bundle this new file.
- WebView code and styles must be provided to the `papi` as strings, so you can import WebView files with [`?inline`](#special-imports) after the file path to import the file as a string.

### Special imports

- Adding `?inline` to the end of a file import causes that file to be imported as a string after being transformed by webpack loaders but before bundling dependencies (except if that file is a React WebView file, in which case dependencies will be bundled). The contents of the file will be on the file's default export.
  - Ex: `import myFile from './file-path?inline`
- Adding `?raw` to the end of a file import treats a file the same way as `?inline` except that it will be imported directly without being transformed by webpack.

### Misc features

- Paranext extension code must be bundled all together in one file, so webpack bundles all the code together into one main extension file.
- Paranext extensions can interact with other extensions, but they cannot import and export like in a normal Node environment. Instead, they interact through the `papi`. As such, the `src/types` folder contains this extension's declarations file that tells other extensions how to interact with it through the `papi`.

### Two-step webpack build

This extension template is built by webpack (`webpack.config.ts`) in two steps: a WebView bundling step and a main bundling step:

#### Build 1: TypeScript WebView bundling

Webpack (`./webpack/webpack.config.web-view.ts`) prepares TypeScript WebViews for use and outputs them into temporary build folders adjacent to the WebView files:

- Formats WebViews to match how they should look to work in Paranext
- Transpiles React/TypeScript WebViews into JavaScript
- Bundles dependencies into the WebViews
- Embeds Sourcemaps into the WebViews inline

#### Build 2: Main and final bundling

Webpack (`./webpack/webpack.config.main.ts`) prepares the main extension file and bundles the extension together into the `dist` folder:

- Transpiles the main TypeScript file and its imported modules into JavaScript
- Injects the bundled WebViews into the main file
- Bundles dependencies into the main file
- Embeds Sourcemaps into the file inline
- Packages everything up into an extension folder `dist`
