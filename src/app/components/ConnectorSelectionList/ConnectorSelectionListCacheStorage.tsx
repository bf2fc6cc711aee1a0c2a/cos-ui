import React, { createContext, FC, useContext } from 'react';

import { FeaturedConnectorType } from './typeExtensions';

export type ConnectorSelectionListCacheStorageContextType = {
  clear: () => void;
  find: (
    condition: (item: FeaturedConnectorType | boolean) => boolean
  ) => FeaturedConnectorType | boolean;
  get: (index: number) => FeaturedConnectorType | boolean;
  init: (
    initialSet: Array<FeaturedConnectorType | boolean>,
    total: number
  ) => void;
  put: (
    index: number,
    item: FeaturedConnectorType | boolean
  ) => FeaturedConnectorType | boolean;
};

const ConnectorSelectionListCacheStorageContext =
  createContext<ConnectorSelectionListCacheStorageContextType>({
    clear: () => {},
    get: (_) => false,
    init: (_) => {},
    find: (_) => false,
    put: (_) => false,
  });

export const ConnectorSelectionListCacheStorageProvider: FC<{}> = ({
  children,
}) => {
  let cachedTotal = 0;
  let cache: { [key: number]: FeaturedConnectorType | boolean } = {};

  const init = (
    initialSet: Array<FeaturedConnectorType | boolean>,
    total: number
  ) => {
    if (total === cachedTotal) {
      return;
    }
    const loadedConnectorTypesMap: {
      [key: number]: FeaturedConnectorType | boolean;
    } = Array.from({ length: total - 1 })
      .map((_, index) => ({ [index]: false }))
      .reduce((prev, current) => ({ ...prev, ...current }), {});
    if (typeof initialSet !== 'undefined' && initialSet !== null) {
      initialSet.forEach(
        (item, index) => (loadedConnectorTypesMap[index] = item)
      );
    }
    cachedTotal = total;
    cache = loadedConnectorTypesMap;
  };

  const get = (index: number) => cache[index];
  const put = (index: number, item: FeaturedConnectorType | boolean) => {
    const old = cache[index];
    cache[index] = item;
    return old;
  };
  const find = (
    condition: (item: FeaturedConnectorType | boolean) => boolean
  ) => {
    return Object.values(cache).find(condition) || false;
  };
  const clear = () => {
    cachedTotal = 0;
    cache = {};
  };

  return (
    <ConnectorSelectionListCacheStorageContext.Provider
      value={{
        clear,
        get,
        init,
        find,
        put,
      }}
    >
      {children}
    </ConnectorSelectionListCacheStorageContext.Provider>
  );
};

export const useConnectorSelectionListCacheStorage =
  (): ConnectorSelectionListCacheStorageContextType => {
    const service = useContext(ConnectorSelectionListCacheStorageContext);
    if (!service) {
      throw new Error(
        `useConnectorSelectionListCacheStorage() must be used in a child of <ConnectorSelectionListCacheStorageContextProvider>`
      );
    }
    return service;
  };
