# @cos-ui 

## Run the UI as a standalone application

```sh
yarn install
yarn start
```

This will start the standalone app on `https://prod.foo.redhat.com:1337/`. 

## Run the UI as a federated module consumed by the application-services-ui app

```sh
yarn install
yarn start:federate
```

This will run a dev server on http://localhost:9002 that will serve a federated module named `cos`.

### Running Cypress

In one terminal run the application in E2E mode:

```sh
yarn start:e2e
```

In a second terminal run Cypress in the interactive mode

```sh
yarn cypress:open
```

or if you want to run the tests against an headless Chrome

```sh
yarn cypress
```

