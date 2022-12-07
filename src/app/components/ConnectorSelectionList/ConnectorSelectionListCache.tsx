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
  getRowById: (props: { id: string }) => FeaturedConnectorType | boolean;
};

const ConnectorSelectionListCacheContext =
  createContext<ConnectorSelectionListCacheContextType>({
    isRowLoaded: (_) => false,
    loadMoreRows: (_) => Promise.resolve(),
    getRow: (_) => false,
    getRowById: (_) => false,
  });

export type ConnectorSelectionListCacheContextProviderProps = {
  connectorsApiBasePath: string;
  getToken: () => Promise<string>;
  search: ConnectorTypesSearch;
  orderBy: ConnectorTypesOrderBy;
  initialSet: Array<FeaturedConnectorType> | undefined;
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
  size,
  total,
  children,
}) => {
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
  const isRowLoaded = ({ index }: { index: number }): boolean =>
    !!loadedConnectorTypesMap[index];
  const loadMoreRows = ({
    startIndex,
    stopIndex,
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (typeof initialSet === 'undefined' || total === 0) {
      // react-virtualized can still ask for entries, but we're loading
      return Promise.resolve();
    }
    const numPages = Math.ceil((stopIndex - startIndex) / size) || 1;
    const startPage = Math.floor(startIndex / size) + 1;
    return new Promise<void>((resolve, reject) => {
      const pageIndices = [...Array(numPages).keys()];
      pageIndices.forEach((pageIndex: number) => {
        fetchConnectorTypes({
          accessToken: getToken,
          connectorsApiBasePath,
        })(
          { page: startPage + pageIndex, size, search, orderBy },
          ({ page, size, items }) => {
            const offset = (page - 1) * size;
            if (items) {
              items.forEach((item, index) => {
                loadedConnectorTypesMap[offset + index] =
                  item as FeaturedConnectorType;
              });
            }
            if (pageIndex === pageIndices.length - 1) {
              resolve();
            }
          },
          (error) => {
            console.debug('error fetching items for cache: ', error);
            reject(error);
          }
        );
      });
    });
  };
  const getRow = ({ index }: { index: number }) =>
    loadedConnectorTypesMap[index];
  const getRowById = ({ id }: { id: string }) =>
    Object.values(loadedConnectorTypesMap).find(
      (connector) => typeof connector !== 'boolean' && connector!.id === id
    ) || false;
  return (
    <ConnectorSelectionListCacheContext.Provider
      value={{
        isRowLoaded,
        loadMoreRows,
        getRow,
        getRowById,
      }}
    >
      {children}
    </ConnectorSelectionListCacheContext.Provider>
  );
};

export const useConnectorSelectionListCache =
  (): ConnectorSelectionListCacheContextType => {
    const service = useContext(ConnectorSelectionListCacheContext);
    if (!service) {
      throw new Error(
        `useConnectorTypesGalleryCache() must be used in a child of <ConnectorTypesGalleryCacheContextProvider>`
      );
    }
    return service;
  };
