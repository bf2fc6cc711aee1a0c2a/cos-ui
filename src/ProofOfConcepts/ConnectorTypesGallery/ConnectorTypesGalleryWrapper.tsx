import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  fetchConnectorTypes,
} from '@apis/api';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { useCos } from '@hooks/useCos';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { ConnectorTypesGallery } from './ConnectorTypesGallery';
import { ConnectorTypesGalleryCacheProvider } from './ConnectorTypesGalleryCache';
import { fetchConnectorTypeLabels } from './apiExtensions';
import {
  ConnectorTypeLabelCount,
  FeaturedConnectorType,
} from './typeExtensions';

export type ConnectorTypesGalleryWrapperProps = {
  useMasonry?: boolean;
};
export const ConnectorTypesGalleryWrapper: FC<ConnectorTypesGalleryWrapperProps> =
  ({ useMasonry }) => {
    const { t } = useTranslation();
    const { connectorsApiBasePath, getToken } = useCos();
    const [connectorTypes, setConnectorTypes] = useState<
      Array<FeaturedConnectorType> | undefined
    >(undefined);
    const [labels, setLabels] = useState<
      Array<ConnectorTypeLabelCount> | undefined
    >(undefined);
    const [pagination, setPagination] = useState({
      page: 1,
      size: 9,
      total: 0,
    });
    const [orderBy, setOrderBy] = useState<ConnectorTypesOrderBy>({
      featured_rank: 'desc',
      name: 'asc',
    });
    const [search, setSearch] = useState<ConnectorTypesSearch>({
      name: '',
      label: [],
    });
    const { page, size, total } = pagination;

    const onGetConnectorTypes = useCallback(
      ({ page, size, items, total }) => {
        setConnectorTypes(items);
        setPagination({ page, size, total });
      },
      [setConnectorTypes, setPagination]
    );

    const onGetConnectorTypeLabels = useCallback(
      ({ items }) => {
        setLabels(items);
      },
      [setLabels]
    );

    const doFetchConnectorTypes = useCallback(() => {
      fetchConnectorTypes({
        accessToken: getToken,
        connectorsApiBasePath,
      })(
        {
          page,
          size,
          search,
          orderBy,
        },
        onGetConnectorTypes,
        () => {} // error case - TODO
      );
    }, [
      getToken,
      connectorsApiBasePath,
      onGetConnectorTypes,
      page,
      size,
      orderBy,
      search,
    ]);

    const doFetchConnectorTypeLabels = useCallback(() => {
      fetchConnectorTypeLabels({
        accessToken: getToken,
        connectorsApiBasePath,
      })(
        {
          search: {
            name: search.name,
            label: (search.label || []).filter(
              (label) => label === 'source' || label === 'sink'
            ),
          },
          orderBy,
        },
        onGetConnectorTypeLabels,
        () => {} // error case - TODO
      );
    }, [
      getToken,
      connectorsApiBasePath,
      onGetConnectorTypeLabels,
      orderBy,
      search,
    ]);

    const doSetOrderBy = useCallback(
      (column: string) => {
        setConnectorTypes(undefined);
        setLabels(undefined);
        const primarySort = Object.keys(orderBy)[0] || 'featured_rank';
        switch (column) {
          case 'featured_rank':
            if (primarySort === 'featured_rank') {
              setOrderBy({
                featured_rank:
                  orderBy.featured_rank === 'desc' ? 'asc' : 'desc',
                name: orderBy.name === 'asc' ? 'desc' : 'asc',
              });
            } else {
              setOrderBy({
                featured_rank: 'desc',
                name: 'asc',
              });
            }
            break;
          case 'name':
            setOrderBy({
              name:
                primarySort !== 'name'
                  ? 'asc'
                  : orderBy.name === 'asc'
                  ? 'desc'
                  : 'asc',
            });
            break;
        }
      },
      [orderBy]
    );

    const doSetNameSearch = useCallback(
      (name: string) => {
        setConnectorTypes(undefined);
        setSearch({ ...search, name });
      },
      [setSearch, search]
    );

    const doSetLabelSearch = useCallback(
      (label: Array<string>) => {
        setConnectorTypes(undefined);
        setSearch({ ...search, label });
      },
      [setSearch, search, setConnectorTypes]
    );

    const sortInputEntries = [
      {
        label: 'Sort by Name',
        value: 'name',
      },
      {
        label: 'Sort by Featured',
        value: 'featured_rank',
      },
    ];

    useEffect(() => {
      doFetchConnectorTypes();
      doFetchConnectorTypeLabels();
    }, [doFetchConnectorTypes, doFetchConnectorTypeLabels]);

    console.log('Labels: ', labels);
    return (
      <StepBodyLayout
        title={t('connector')}
        description={
          'The selected connector is the basis for your Connectors instance.'
        }
      >
        <ConnectorTypesGalleryCacheProvider
          connectorsApiBasePath={connectorsApiBasePath}
          getToken={getToken}
          search={search}
          orderBy={orderBy}
          initialSet={connectorTypes}
          page={page}
          size={size}
          total={total}
          useMasonry={useMasonry}
        >
          <ConnectorTypesGallery
            total={total}
            connectorTypes={connectorTypes}
            labels={labels}
            sortInputEntries={sortInputEntries}
            currentSort={orderBy}
            onChangeSort={doSetOrderBy}
            searchFieldValue={search.name || ''}
            searchFieldPlaceholder={'Search'}
            onChangeSearchField={doSetNameSearch}
            selectedCategories={search.label || []}
            onChangeLabelFilter={doSetLabelSearch}
          />
        </ConnectorTypesGalleryCacheProvider>
      </StepBodyLayout>
    );
  };
