import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  fetchConnectorTypes,
} from '@apis/api';
import React, { FC, createContext, useContext } from 'react';

import { FeaturedConnectorType } from './typeExtensions';

export type ConnectorSelectionListCacheContextType = {
  isRowLoaded: (props: { index: number }) => boolean;
  loadMoreRows: (props: {
    startIndex: number;
    stopIndex: number;
  }) => Promise<void>;
  getRow: (props: { index: number }) => FeaturedConnectorType | boolean;
};

const ConnectorSelectionListCacheContext =
  createContext<ConnectorSelectionListCacheContextType>({
    isRowLoaded: (_) => false,
    loadMoreRows: (_) => Promise.resolve(),
    getRow: (_) => false,
  });

export type ConnectorSelectionListCacheContextProviderProps = {
  connectorsApiBasePath: string;
  getToken: () => Promise<string>;
  search: ConnectorTypesSearch;
  orderBy: ConnectorTypesOrderBy;
  initialSet: Array<FeaturedConnectorType> | undefined;
  page: number;
  size: number;
  total: number;
};

export const ConnectorSelectionListCacheProvider: FC<
  ConnectorSelectionListCacheContextProviderProps
> = ({
  connectorsApiBasePath,
  getToken,
  search,
  orderBy,
  initialSet,
  page,
  size,
  total,
  children,
}) => {
  let highestLoadedPage = page;
  let highestLoadedIndex = highestLoadedPage * size;
  const loadedConnectorTypesMap: {
    [key: number]: FeaturedConnectorType | boolean;
  } = Array.from({ length: total - 1 })
    .map((_, index) => ({ [index]: false }))
    .reduce((prev, current) => ({ ...prev, ...current }), {});
  if (typeof initialSet !== 'undefined') {
    initialSet.forEach(
      (item, index) => (loadedConnectorTypesMap[index] = item)
    );
  }
  const isRowLoaded = ({ index }: { index: number }): boolean =>
    !!loadedConnectorTypesMap[index];
  const loadMoreRows = ({
    startIndex,
    stopIndex,
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (startIndex > highestLoadedIndex || stopIndex > highestLoadedIndex) {
      return new Promise<void>((resolve, reject) => {
        fetchConnectorTypes({
          accessToken: getToken,
          connectorsApiBasePath,
        })(
          { page: highestLoadedPage + 1, size, search, orderBy },
          ({ page, size, items }) => {
            highestLoadedPage = page;
            const previousHighestLoadedIndex = highestLoadedIndex;
            highestLoadedIndex = highestLoadedPage * size;
            items.forEach((item, index) => {
              loadedConnectorTypesMap[previousHighestLoadedIndex + index] =
                item as FeaturedConnectorType;
            });
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
    return Promise.resolve();
  };
  const getRow = ({ index }: { index: number }) =>
    loadedConnectorTypesMap[index];
  return (
    <ConnectorSelectionListCacheContext.Provider
      value={{
        isRowLoaded,
        loadMoreRows,
        getRow,
      }}
    >
      {children}
    </ConnectorSelectionListCacheContext.Provider>
  );
};

export const useConnectorTypesGalleryCache =
  (): ConnectorSelectionListCacheContextType => {
    const service = useContext(ConnectorSelectionListCacheContext);
    if (!service) {
      throw new Error(
        `useConnectorTypesGalleryCache() must be used in a child of <ConnectorTypesGalleryCacheContextProvider>`
      );
    }
    return service;
  };
