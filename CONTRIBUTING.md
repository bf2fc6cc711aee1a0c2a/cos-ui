# Contributing to cos-ui

The MAS-Connectors community welcomes anyone that wants to help out in any way, whether that includes reporting problems, helping with documentation, or contributing code changes to fix bugs, add tests, or implement new features. This document outlines the basic steps required to work with and contribute to the cos-ui codebase.

## Internationalization

This project uses [react-i18next](https://react.i18next.com/) for internationalization. Check out the existing examples in the code or the documentation for more information on how to use it.

You should run `npm run i18n` after you internationalize strings in order to generate the required files.

If you want to add an additional language, you need to import the dayjs locale in `src/i18n.ts` on line 9 and (if you want it managed by the parser) line 51 in `i18next-parser.config.js`.

## Query parameters

```
# Turn on pseudolocalization
# This will let you check components to make sure they can accomodate longer text and ensure that all text is internationalized.
http://localhost:9002/?pseudolocalization=true&lng=en

# Change language to Japanese (if you don't want to change your browser language)
http://localhost:9002/?lng=ja
```
## API

By default the UI will run against the staging api (api.stage.openshift.com) in development. To change the API server set the environment variable `BASE_PATH`.

For example:

```
BASE_PATH=http://localhost:8000
```

## Run the UI as a standalone application

```sh
npm install
npm run start
```

This will start the standalone app on `https://prod.foo.redhat.com:1337/`. 

- make sure you have `127.0.0.1 prod.foo.redhat.com` in your hosts file for this to work.
- you can also change the backend (fleet-manager) that the app will point to in the `.env` file.

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

## Coding Standards

The cos UI projects uses best practices based off the official [React TypeScript Cheat sheet](https://react-typescript-cheatsheet.netlify.app/), with modifications for this project. The React TypeScript Cheat sheet is maintained and used by developers through out the world, and is a place where developers can bring together lessons learned using TypeScript and React.

### Imports

Since we are using TypeScript 4.x + for this project, default imports should conform to the new standard set forth in TypeScript 2.7:

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
```

For imports that are not the default import use the following syntax:

```typescript
import { X1, X2, ... Xn } from 'package-x';
```

### View Props

Since Kafka UI is made up of 2 different views (one for PatternFly, and one for Carbon) props for a component should be declared in separate file instead of within the components source code. For example Carbon views are written in **View.carbon.tsx**, while PatternFly views are written in **View.patternfly.tsx**. In order to allow the views to share the same props, the code for the props should live in **View.props.tsx**.

For props we are using **type** instead of **interfaces**. The reason to use types instead of interfaces is for consistency between the views and because it's more constrained (See [Types or Interfaces](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces) for more clarification). By using types we are ensuring that both views will not deviate from the agreed upon [contract](https://dev.to/reyronald/typescript-types-or-interfaces-for-react-component-props-1408).

The following is an example of using a type for props:

```typescript
export type ExampleComponentProps = {
  message: string;
};
```

Since we are using typescript we no longer need to use prop-types as typescript provides the functionality we received with prop-types via types. To set the default value of the props you can do so in by specifying a value in the argument's for the function component. The following is an example on how to do that:

```typescript
type GreetProps = { age?: number };

const Greet: FunctionComponent<GreetingProps> = ({ age = 21 }: GreetProps) => // etc
```

### State objects should be types

When maintaining state for a component that requires it's state to be defined by an object, it is recommended that you use a [type instead of an interface](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces). For example if you need to maintain the currentApiId and isExpanded in a single object you can do the following:

```typescript
type ApiDrawerState = {
  currentApiId: string;
  isExpanded: boolean;
};
```
### Interfaces

Interfaces should be used for all public facing API definitions, as well as models. A table describing when to use interfaces vs. types can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/types_or_interfaces).

```typescript
// The following is an example of memory information model

export interface MemoryInfoRepresentation {
  total: number;
  totalFormatted: string;
  used: number;
  usedFormatted: string;
  free: number;
  freePercentage: number;
  freeFormatted: string;
}
```

### Function Components

This project uses function components and hooks over class components. When coding function components in typescript a developer should include any specific props from the **View.props.tsx**

```typescript
export const ExampleComponent: FunctionComponent<ExampleComponentProps> = ({
  message,
  children,
}: ExampleComponentProps) => (
  <>
    <div>{message}</div>
    <div>{children}</div>
  </>
);
```

For components that do not have any additional props an empty object should be used instead:

```typescript
export const ExampleNoPropsComponent: FunctionComponent<{}> = () => (
  <div>Example Component with no props</div>
);
```

Additional details around function components can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/function_components).

### Hooks

When using hooks with Typescript there are few recommendations that we follow below. Additional recommendations besides the ones mention in this document can be found [here](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks).

#### Inference vs Types for useState

Currently we recommend using inference for the primitive types booleans, numbers, and string when using useState. Anything other then these 3 types should use a declarative syntax to specify what is expected. For example the following is an example of how to use inference:

```typescript
const [isEnabled, setIsEnabled] = React.useState(false);
```

Here is an example how to use a declarative syntax. When using a declarative syntax if the value can be null that will also need to be specified:

```typescript
const [user, setUser] = useState<IUser | null>(null);

setUser(newUser);
```

#### useReducers

When using reducers make sure you specify the [return type and do not use inference](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#usereducer).

```typescript
const initialState = { count: 0 };

type ACTIONTYPE =
  | { type: 'increment'; payload: number }
  | { type: 'decrement'; payload: string };

function reducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + action.payload };
    case 'decrement':
      return { count: state.count - Number(action.payload) };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement', payload: '5' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'increment', payload: 5 })}>
        +
      </button>
    </>
  );
}
```
#### useEffect

For useEffect only [return the function or undefined](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useeffect).

```typescript
function DelayedEffect(props: { timerMs: number }) {
  const { timerMs } = props;
  // bad! setTimeout implicitly returns a number because the arrow function body isn't wrapped in curly braces
  useEffect(
    () =>
      setTimeout(() => {
        /* do stuff */
      }, timerMs),
    [timerMs]
  );
  return null;
}
```

#### useRef

When using useRef there are two options with Typescript. The first one is when creating a [read-only ref](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useref).

```typescript
const refExample = useRef<HTMLElement>(null!);
```

By passing in null! it will prevent Typescript from returning an error saying refExample maybe null.

The second option is for creating [mutable refs](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks#useref) that you will manage.

```typescript
const refExampleMutable = (useRef < HTMLElement) | (null > null);
```

### Additional Typescript Pointers

Besides the details outlined above a list of recommendations for Typescript is maintained by several Typescript React developers [here](https://react-typescript-cheatsheet.netlify.app/). This is a great reference to use for any additional questions that are not outlined within the coding standards.

### Keycloak integration

In our dev environment we use keycloak to obtain the token to authenticate requests. The `KeycloakAuthProvider` is responsible for setting this up.

In stage and prod we use the insights chrome to do this. The `InsightsAuthProvider` (which lives in the `mk-ui-host` project) is responsible for setting this up.

1. To integrate with keycloak go to your keycloak instance and retrieve keycloak.json config
   file for public client. Make sure that client config supports redirect uris:

`localhost*` or `localhost:8080`

2. Put `keycloak.json` info dist folder.
   See`keycloak.example.json` for example content.

3. Run the application.

> NOTE: Keycloak.js package updates are disabled and should be done manually if needed.

#### Using Keycloak Profile in the application

```js
const { keycloak, profile } = useContext(AuthContext);
console.log(user.profile);
```

#### Using Keycloak Token for backend requests

```js
const { keycloak } = useContext(AuthContext);
const header = keycloak.getAuthHeader();
```