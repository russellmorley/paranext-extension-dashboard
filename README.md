# Dashboard Web Components for Paranext, Dashboard, and Web Portals

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

### Components and Naming Patterns

- `extension-host` _(For **ParanextExtensionHostComponents**)_
  - `services`
    - `services/extension-storage.persist.service` _(For **ParanextExtensionHostComponents**: exposes `papi.backend.storage` as `IPersist` to support
    service persistence (e.g. caching) when exposed as **ParanextCommandExtensions** or **ParanextDataEngineExtensions**)_ 
  - `extension-host/utils`
    - `utils/http.papiback.requester.util` _(For **ParanextExtensionHostComponents**: implements `Requester` using `papi.backend`)_
  - `dataproviders`
    - `aqua-dataprovider` _(For **ParanextDataEngineExtension**: makes `aqua.service` functionality available to other **ParanextWebviewExtensions** and **ParanextExtensionHostComponents** as a Paranext `DataProviderEngine`. Uses `extension-storagepersist.service` to persist in Paranext Extension Host's-preferred way.)_
- `renderer`  _(For **BrowserApps**)_
  - `renderer/services`
    - `renderer/services/indexeddb-persist-service` _(For **SPA**: implements `IPersist` for web applications)_
  - `renderer/utils`  
    - `renderer/utils/http.browser.requester.util`  _(For **SPA**: implements `Requester` for web applications)_
    - `renderer/utils/http.papifront.requester.util`  _(For **ParanextWebviewExtensions**: implements `Requester` using `papi.frontend`)_
    - `renderer/utils/async-task.util`  _(For **SPA**: Implements `IAsyncTask`. Should work for both **SPA** and **ParanextWebviewExtensions**, although paranext work would ideally be delegated to a separate **ParanextCommandExtension** or **ParanextDataEngineExtension** that runs in paranext's Extension Host process that can be shared with other extensions)_
  - `renderer/[app name].web-view.tsx` _(The root component. Responsible for providing the environment context, including which requester, persist, and task implementations to use based on deployment scenario (e.g. as an extension, or in a web portal, or in dashboard), to child [app name].app.component.tsx )_
  - `renderer/[app name].app.component.tsx` _(The base application component. Responsible for orchestrating navigation, layout, and skin to child components)_
  - `renderer/[app name].[data type].datacontext.tsx` _(Responsible for providing appropriate data context to child React components through a `renderer/[data type].context`.)_
  - `renderer/[data type].context.ts` _(Implementation of datacontext as a React context.)_
  - `renderer/[visualization].[data type].component.tsx` _(a visualization component that consumes data type, provided to it through a `renderer/[data type].context` by a parent `renderer/[app name].[data type].datacontext.tsx`)_
  - `renderer/*.component.tsx` _(a reusable React component. Data to this component is provided through params and not context, making such components not dependent on any `renderer/[app name].[data type].datacontext.tsx`)_
- `shared` _(for both **BrowserApps** and **ParanextExtensionHost** extensions)_
  - `services`
    - `shared/services/[app name].service` _(service interface for AQuA, which uses an implementation of `Requester` to make requests to AQuA's endpoints and `IPersist` to support persistent caching through `cache.service`)_
    - `shared/services/cache.service` _(provides caching for services. Uses an implementation of `IPersist` for persistent storage as configured by the environment context, e.g. indexeddb for web portals, extension-storage.persist.service for paranext extensions)_
  - `services/utils`
    - `shared//services/async-lock.util` _(a JS promise-based non-blocking lock for synchronizing in-process async operations, e.g. syncing `aqua.service` remote and cache updates, and `cache.service` updates to shared map and `IPersist`)_
    - `array-manipulations.util` _(utilities for processing arrays, e.g. `groupBy()`)_

## Assembling components 

### Paranext

#### Example - AQuA in Paranext for Translators

In the following example illustration, 

- an AQuA heatmap and other chart visualizations sit alongside the translators' editor.
- AQuA's heatmap visualization also includes the text itself, tokenized, with an interlinear gloss to English, and contextual enhanced resource and linguistic information as popovers from Dashboard Insights Services.
- AQuA (and other linguistic source) information is also integrated into the translator's editor itself, providing missing words as a popover and extra words underlined along with spot translations, word completion, identifying marks indicating biblical terms, enhanced resource information, ChatGPT linguistic analysis of the sentence, etc., from other cloud sources.
- Uses a separate headless (no UI) extension that interacts with AQuA's machine learning cloud endpoints using PAPI backend `fetch` and persists data using PAPI extension storage through `extension-storage.persist.service` so that other extensions can also reuse AQuA's machine learning services and data is only obtained once from the cloud endpoints and saved for improved performance and reduced cloud service cost.
- Notice how the components are the same as for other configurations, including those for both translators and translation consultants in paranext, on the web in web portals, and even in Dashboard's current application. 

  
![Dashboard and Platform bible integration strategy-Paranext for translators w_ AQua drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/7ad18b2e-645d-4f74-95f6-b8ada1dc6752)

(Using old Paratext 9 UI for illustrative purposes.)

##### Component details
The following assembly of components results in an AQuA histogram webview that caches data for offline use and displays assessment results centered on the current Paranext verse:

- `renderer/aqua.web-view.tsx` - connects to Paranext (and Dashboard) verse change events and configures the child context environment to use `httpPapiFrontRequester` as the network `Requester`, `AsyncTask` (uses WebWorkers) for async processing of long tasks, and `extension-storage.persist.service` for caching data to disk using `Papi.backend` (Paranext Extension Host's) `storage` service. 
- `renderer/aqua.xyvalues.datacontext.tsx` to use `aqua.service` to obtain data from AQuA's machine learning endpoints using the requester provided by the parent environment (`httpPapiFrontRequester`), cache and persist it, the latter using `IPersist` provided by the parent environment (`extension-storage.persist.service`), and make it available to child components as `XYValuesInfo`. Note that this is the only AQuA specific component in this deployment scenario.
- `renderer/charts.xyvalues.component.tsx` to display `XYValuesInfo` using an aggregate of a charting library and `dualslider.component.tsx` to filter data ranges.

#### Example - AQuA in Paranext for Translation Consultants

In the following example illustration, 

- Dashboard's stacked, configurable view of the verse in various languages with alignments and glossing now sits alongside the translator's editor in Paranext itself and no longer needs to run in a separate 'Dashboard' application.
- AQuA (and other linguistic source) information is also integrated into the translator's editor itself, providing missing words in a popover and extra words underlined, along with spot translations, word completion, identifying marks indicating biblical terms, enhanced resource information, ChatGPT linguistic analysis of the sentence, etc. from other linguistic cloud sources.
- Uses a separate headless (no UI) extension that interacts with AQuA's machine learning cloud endpoints using PAPI backend `fetch` and persists data using PAPI extension storage through `extension-storage.persist.service` so that other extensions can also reuse AQuA's machine learning services and data is only obtained once from the cloud endpoints and saved for improved performance and reduced cloud service cost.
- Notice how the components are the same as for other configurations, including those for both translators and translation consultants in paranext, on the web in web portals, and even in Dashboard's current application.
  
![Dashboard and Platform bible integration strategy4-Paranext For TCs drawio(2)](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/16d6c5c2-6755-430a-a5a4-44f8c1caa179)

(Using old Paratext 9 UI for illustrative purposes.)

### Dashboard

#### Example - Dashboard

Exactly the same as for 'Example - AQuA, with `renderer/dashboard-integration.web-view.tsx` used by a headless browser in Dashboard to provide PAPI access to Dashboard api services.


### Web 

As a part of a single page app web portal that directly interacts with AQuA's machine learning endpoints using the browser's native `fetch` through `httpBrowserRequester` and persists data to the browser's native IndexedDb through `indexeddb.persist.service`. _Notice that components under `portal.tsx` are exactly the same as for Paranext and Dashboard deployement scenarios for the portal's 'histogram' charting of Results portion of overall functionality, except the developer chose to remove `componentlist.component.tsx` since a display in rows was not desired.

![Dashboard and Platform bible integration strategy-AQuA Web Portal drawio](https://github.com/russellmorley/paranext-extension-dashboard/assets/7842248/fafb3a4b-32ed-4a0b-99ab-3f5ddd4ed646)

(Using old Paratext 9 UI for illustrative purposes.)

##### Component details

- `index.html` - (not included in repo) bootstraps React, loading:
- `portal.tsx` - (not included in repo) configures the child context environment to use `httpBrowserRequester` as the network `Requester`, `AsyncTask` (uses WebWorkers)for async processing of long tasks, and `indexeddb.persist.service` for caching data using the browser's built-in data storage facility (IndexedDB).
- `renderer/aqua.xyvalues.datacontext.tsx` to use `aqua.service` to obtain data from AQuA's endpoints using the requester provided by the parent environment (`httpBrowserRequester`), cache and persist it, the latter using `IPersist` provided by the parent environment (`indexeddb.persist.service`), and make it available to child components as `XYValuesInfo`. Note that this is the only AQuA specific component in this deployment scenario.
- `renderer/charts.xyvalues.component.tsx` to display `XYValuesInfo` using an aggregate of a charting library and `dualslider.component.tsx` to filter data ranges.

## To install

  ### Paranext

  #### Development

1. Clone [this repository](https://github.com/russellmorley/paranext-extension-dashboard)
2. `cd paranext-extension-dashboard` and run `npm install`.
3. `cd ..` and then `git clone https://github.com/russellmorley/paranext-core` (should create a sibling directory `paranext-core`) , 
4. `cd paranext-core` and then `git checkout dashboard` (Switch to the 'dashboard' branch)
5. follow [instructions in readme](https://github.com/paranext/paranext-core?tab=readme-ov-file#developer-install), including
running `npm install`.
6. Set the generative model keys in src/shared/services/textinsights.service.ts lines 51, 80, and 128 for 
deep-translate1.p.rapidapi.com detect, translate, and ChatGPT, respectively.

  #### To package for production

To package your extension into a zip file for distribution:

`npm run package`

  ### Dashboard

  #### Development

1. Clone, switch to the `paranext` branch, and build [`Dashboard, Paranext Branch`](https://github.com/Clear-Bible/ClearDashboard/tree/paranext)
1. Clone [this repository](https://github.com/russellmorley/paranext-extension-dashboard)
2. `cd paranext-extension-dashboard` and run `npm install`.
3. `cd ..` and then `git clone https://github.com/russellmorley/paranext-core` (should create a sibling directory `paranext-core`) , 
4. `cd paranext-core` and then `git checkout dashboard` (Switch to the 'dashboard' branch)
5. follow [instructions in readme](https://github.com/paranext/paranext-core?tab=readme-ov-file#developer-install), including
running `npm install`.
6. Set the generative model keys in src/shared/services/textinsights.service/ts lines 51, 80, and 128 for 
deep-translate1.p.rapidapi.com detect, translate, and ChatGPT, respectively.

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

  ### Test in browser

1.  change directory to `paranext-extension-dashboard` from your parent repo directory (the directory that contains both `paranext-extension-dashboard` and `paranext-core`).
2. `npm run start:PAPI-standalone`
3. Navigate browser:
    1. Open a browser tab and navigate to http://localhost:1212/aqua_webview?assessment_id=211&version_id=71 to view the AQuA web app.
    2. Open another browser tab and navigate to http://localhost:1212/corpusinsights_webview?tokenizedtextcorpus_id=32&verseref=GEN%201%3A4&versesbeforenumber=0&versesafternumber=0 to view the tokenized corpus webview.

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
