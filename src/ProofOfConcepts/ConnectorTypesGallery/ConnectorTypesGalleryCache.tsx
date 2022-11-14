import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  fetchConnectorTypes,
} from '@apis/api';
import React, { FC, createContext, useContext } from 'react';

import { FeaturedConnectorType } from './typeExtensions';

export type ConnectorTypesGalleryCacheContextType = {
  isRowLoaded: (props: { index: number }) => boolean;
  loadMoreRows: (props: {
    startIndex: number;
    stopIndex: number;
  }) => Promise<void>;
  getRow: (props: { index: number }) => FeaturedConnectorType | boolean;
  useMasonry: boolean;
};

const ConnectorTypesGalleryCacheContext =
  createContext<ConnectorTypesGalleryCacheContextType>({
    isRowLoaded: (_) => false,
    loadMoreRows: (_) => Promise.resolve(),
    getRow: (_) => false,
    useMasonry: false,
  });

export type ConnectorTypesGalleryCacheContextProviderProps = {
  connectorsApiBasePath: string;
  getToken: () => Promise<string>;
  search: ConnectorTypesSearch;
  orderBy: ConnectorTypesOrderBy;
  initialSet: Array<FeaturedConnectorType> | undefined;
  page: number;
  size: number;
  total: number;
  useMasonry?: boolean;
};

export const ConnectorTypesGalleryCacheProvider: FC<ConnectorTypesGalleryCacheContextProviderProps> =
  ({
    connectorsApiBasePath,
    getToken,
    search,
    orderBy,
    initialSet,
    page,
    size,
    total,
    useMasonry,
    children,
  }) => {
    let highestLoadedPage = page;
    let highestLoadedIndex = highestLoadedPage * size - 1;
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
              items.forEach(
                (item, index) =>
                  (loadedConnectorTypesMap[highestLoadedIndex + index] =
                    item as FeaturedConnectorType)
              );
              highestLoadedIndex = highestLoadedPage * size - 1;
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
      <ConnectorTypesGalleryCacheContext.Provider
        value={{
          isRowLoaded,
          loadMoreRows,
          getRow,
          useMasonry: !!useMasonry,
        }}
      >
        {children}
      </ConnectorTypesGalleryCacheContext.Provider>
    );
  };

export const useConnectorTypesGalleryCache =
  (): ConnectorTypesGalleryCacheContextType => {
    const service = useContext(ConnectorTypesGalleryCacheContext);
    if (!service) {
      throw new Error(
        `useConnectorTypesGalleryCache() must be used in a child of <ConnectorTypesGalleryCacheContextProvider>`
      );
    }
    return service;
  };
