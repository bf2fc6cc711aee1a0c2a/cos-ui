import {
  ConnectorTypesOrderBy,
  ConnectorTypesSearch,
  fetchConnectorTypeLabels,
  fetchConnectorTypes,
} from '@apis/api';
import { EmptyStateFetchError } from '@app/components/EmptyStateFetchError/EmptyStateFetchError';
import { useCos } from '@hooks/useCos';
import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ConnectorTypeAllOf,
  ObjectReference,
} from '@rhoas/connector-management-sdk';

import { useConnectorSelectionListCacheStorage } from './ConnectorSelectionListCacheStorage';
import { ConnectorSelectionListLayout } from './ConnectorSelectionListLayout';
import {
  ConnectorTypeLabelCount,
  FeaturedConnectorType,
} from './typeExtensions';

const DATA_FETCH_SIZE = 10;

export type ConnectorSelectionListInnerProps = {
  renderSelectionList: (props: {
    selectedId: string | undefined;
    onSelect: (connector: ConnectorTypeAllOf & ObjectReference) => void;
  }) => ReactElement;
};

export type ConnectorSelectionListProps = {
  renderSelector: (
    renderSelectionList: (props: {
      selectedId: string | undefined;
      onSelect: (connector: ConnectorTypeAllOf & ObjectReference) => void;
    }) => ReactElement
  ) => ReactElement;
};
export const ConnectorSelectionList: FC<ConnectorSelectionListProps> = ({
  renderSelector,
}) => {
  const { connectorsApiBasePath, getToken } = useCos();
  const { clear: clearCache } = useConnectorSelectionListCacheStorage();
  const [initialSet, setInitialSet] = useState<
    Array<FeaturedConnectorType> | undefined
  >(undefined);
  const [fetchError, setFetchError] = useState<string | undefined>(undefined);
  const [labels, setLabels] = useState<
    Array<ConnectorTypeLabelCount> | undefined
  >(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
  });
  const [orderBy, setOrderBy] = useState<ConnectorTypesOrderBy>({
    featured_rank: 'desc',
    name: 'asc',
  });
  const [search, setSearch] = useState<ConnectorTypesSearch>({
    name: '',
    label: [],
    pricing_tier: '',
  });
  const { page, total } = pagination;
  const { name, label, pricing_tier: pricingTier } = search;

  const onFetchError = useCallback(
    ({ error }) => {
      setFetchError(error);
    },
    [setFetchError]
  );

  const onGetConnectorTypes = useCallback(
    ({ page, items, total }) => {
      setInitialSet(items);
      setPagination({ page, total });
    },
    [setInitialSet, setPagination]
  );

  const onGetConnectorTypeLabels = useCallback(
    ({ items }) => {
      setLabels(items);
    },
    [setLabels]
  );

  const doFetchConnectorTypeLabels = useCallback(() => {
    fetchConnectorTypeLabels({
      accessToken: getToken,
      connectorsApiBasePath,
    })(
      {
        search,
        orderBy,
      },
      onGetConnectorTypeLabels,
      onFetchError
    );
  }, [
    connectorsApiBasePath,
    getToken,
    onFetchError,
    onGetConnectorTypeLabels,
    orderBy,
    search,
  ]);

  const doInitialFetchConnectorTypes = useCallback(() => {
    fetchConnectorTypes({
      accessToken: getToken,
      connectorsApiBasePath,
    })(
      {
        page,
        size: DATA_FETCH_SIZE,
        search,
        orderBy,
      },
      onGetConnectorTypes,
      onFetchError
    );
  }, [
    connectorsApiBasePath,
    getToken,
    onFetchError,
    onGetConnectorTypes,
    orderBy,
    page,
    search,
  ]);

  const doSetOrderBy = useCallback(
    (column: string) => {
      setInitialSet(undefined);
      setLabels(undefined);
      const primarySort = Object.keys(orderBy)[0] || 'featured_rank';
      switch (column) {
        case 'featured_rank':
          if (primarySort === 'featured_rank') {
            setOrderBy({
              featured_rank: orderBy.featured_rank === 'desc' ? 'asc' : 'desc',
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
      setPagination({ page: 1, total: 0 });
      setInitialSet(undefined);
      clearCache();
      setSearch({ ...search, name });
    },
    [clearCache, setSearch, search, setInitialSet]
  );

  const doSetPricingTierSearch = useCallback(
    (pricingTier: string) => {
      setPagination({ page: 1, total: 0 });
      setInitialSet(undefined);
      clearCache();
      // this set timeout ensures the pricing tier filter checkboxes feel responsive to the user
      setTimeout(() => setSearch({ ...search, pricing_tier: pricingTier }), 0);
    },
    [clearCache, setSearch, search, setInitialSet]
  );

  const doSetLabelSearch = useCallback(
    (label: Array<string>) => {
      setPagination({ page: 1, total: 0 });
      setInitialSet(undefined);
      clearCache();
      // this set timeout ensures the source/sink checkboxes feel responsive to the user
      setTimeout(() => setSearch({ ...search, label }), 0);
    },
    [clearCache, setSearch, search, setInitialSet]
  );

  const doResetAllFilters = useCallback(() => {
    setPagination({ page: 1, total: 0 });
    setInitialSet(undefined);
    clearCache();
    setSearch({
      name: '',
      label: [],
      pricing_tier: '',
    });
  }, [clearCache, setSearch, setInitialSet]);

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
    doInitialFetchConnectorTypes();
    doFetchConnectorTypeLabels();
  }, [doInitialFetchConnectorTypes, doFetchConnectorTypeLabels]);

  if (fetchError) {
    return <EmptyStateFetchError message={fetchError} />;
  }

  return (
    <>
      <ConnectorSelectionListLayout
        connectorsApiBasePath={connectorsApiBasePath}
        connectorTypesLoading={typeof initialSet === 'undefined'}
        currentSort={orderBy}
        getToken={getToken}
        initialSet={initialSet}
        labels={labels}
        noFilterResults={initialSet === null}
        orderBy={orderBy}
        search={search}
        searchFieldPlaceholder={'Search'}
        searchFieldValue={name || ''}
        selectedCategories={label || []}
        selectedPricingTier={pricingTier || ''}
        size={DATA_FETCH_SIZE}
        sortInputEntries={sortInputEntries}
        total={total}
        onChangeSort={doSetOrderBy}
        onChangeSearchField={doSetNameSearch}
        onChangeLabelFilter={doSetLabelSearch}
        onChangePricingTierFilter={doSetPricingTierSearch}
        onResetAllFilters={doResetAllFilters}
        onAdjustViewportHeight={(dimensions, viewportEl) => {
          const wizardControlPanel = document.getElementsByClassName(
            'pf-c-wizard__footer'
          );
          const wizardControlPanelHeight = wizardControlPanel.length
            ? (wizardControlPanel[0] as HTMLElement).getBoundingClientRect()
                .height
            : 0;
          const { top } = viewportEl.getBoundingClientRect();
          viewportEl.style.height = `${
            dimensions.height - top - wizardControlPanelHeight - 16
          }px`;
        }}
        renderSelector={renderSelector}
      />
    </>
  );
};
