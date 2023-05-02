import Keycloak, { KeycloakInstance, KeycloakProfile } from 'keycloak-js';
import React, { useContext } from 'react';

export let keycloak: Keycloak.KeycloakInstance | undefined;

/**
 * Get keycloak instance
 *
 * @return an initiated keycloak instance or `undefined`
 * if keycloak isn't configured
 *
 */
export const getKeycloakInstance = async () => {
  if (!keycloak) await init();
  return keycloak;
};

/**
 * Initiate keycloak instance.
 *
 * Set keycloak to undefined if
 * keycloak isn't configured
 *
 */
export const init = async () => {
  try {
    keycloak = new (Keycloak as any)({
      realm: 'redhat-external',
      url: 'https://sso.redhat.com/auth/',
      clientId: 'cloud-services',
      promiseType: 'native',
    });
    if (keycloak) {
      await keycloak.init({
        onLoad: 'login-required',
        promiseType: 'native',
      });
    }
  } catch (e) {
    keycloak = undefined;
    console.warn(
      'Auth: Unable to initialize keycloak. Client side will not be configured to use authentication',
      e
    );
  }
};

/**
 * This function keeps getting called by wslink
 * connection param function, so carry out
 * an early return if keycloak is not initialized
 * otherwise get the auth token
 *
 * @return authorization header or empty string
 *
 */
export const getAuthHeader = async () => {
  if (!keycloak) return '';
  return {
    authorization: `Bearer ${await getKeyCloakToken()}`,
  };
};

/**
 * Use keycloak update token function to retrieve
 * keycloak token
 *
 * @return keycloak token or empty string if keycloak
 * isn't configured
 *
 */
export const getKeyCloakToken = async (): Promise<string> => {
  await keycloak?.updateToken(50);
  if (keycloak?.token) return keycloak.token;
  console.error('No keycloak token available');
  return 'foo';
};

/**
 * Use keycloak update token function to retrieve
 * keycloak token
 *
 * @return keycloak token or empty string if keycloak
 * isn't configured
 *
 */
export const getParsedKeyCloakToken =
  async (): Promise<Keycloak.KeycloakTokenParsed> => {
    await keycloak?.updateToken(50);
    if (keycloak?.tokenParsed) return keycloak.tokenParsed;
    console.error('No keycloak token available');
    return {} as Keycloak.KeycloakTokenParsed;
  };

/**
 * logout of keycloak, clear cache and offline store then redirect to
 * keycloak login page
 *
 * @param keycloak the keycloak instance
 * @param client offix client
 *
 */
export const logout = async (
  keycloak: Keycloak.KeycloakInstance | undefined
) => {
  if (keycloak) {
    await keycloak.logout();
  }
};

// This is a context which can manage the keycloak
export interface IKeycloakContext {
  keycloak?: KeycloakInstance | undefined;
  profile?: KeycloakProfile | undefined;
}

export const KeycloakContext = React.createContext<IKeycloakContext>({
  keycloak: undefined,
});

/**
 * Hook to get ahold of the keycloak instance
 * @returns
 */
export const useKeyCloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error(
      'useKeyCloak must be used inside a KeycloakContext.provider'
    );
  }
  return {
    ...context,
  };
};

/**
 *
 * @returns Hook that just returns a function to get the authorization token
 */
export const useKeyCloakAuthToken = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error(
      'useKeycloakAuthToken must be used inside a KeycloakContext.provider'
    );
  }
  return {
    getKeyCloakToken,
  };
};
