[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

# Application Services Connectors UI

UI is used as federated module in [app-services ui](https://github.com/redhat-developer/app-services-ui) project
that aggretates various service components. 

> NOTE: This repository is used as part of the console.redhat.com

## Run the UI as a standalone application

```sh
npm install
npm run start
```

This will start the standalone app on `https://prod.foo.redhat.com:1337/`. 

## Run the UI as a federated module consumed by the application-services-ui app

```sh
npm install
npm run start:federate
```

This will run a dev server on http://localhost:9002 that will serve a federated module named `cos`.

### Running Cypress

In one terminal run the application in E2E mode:

```sh
npm run start:e2e
```

In a second terminal run Cypress in the interactive mode

```sh
npm run cypress:open
```

or if you want to run the tests against an headless Chrome

```sh
npm run cypress
```

