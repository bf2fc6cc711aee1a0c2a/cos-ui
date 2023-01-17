import { ConnectorTypesOrderBy, ConnectorTypesSearch } from '@apis/api';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import React, { FC, ReactElement } from 'react';
import { Dimensions, ViewportProvider } from 'react-viewport-utils';

import {
  DataList,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

import { ConnectorSelectionListCacheProvider } from './ConnectorSelectionListCache';
import { ConnectorSelectionListFilterPanel } from './ConnectorSelectionListFilterPanel';
import { ConnectorSelectionListItem } from './ConnectorSelectionListItem';
import './ConnectorSelectionListLayout.css';
import { ConnectorSelectionListSkeleton } from './ConnectorSelectionListSkeleton';
import { ConnectorSelectionListToolbar } from './ConnectorSelectionListToolbar';
import { ConnectorSelectionListViewport } from './ConnectorSelectionListViewport';
import {
  ConnectorTypeLabelCount,
  FeaturedConnectorType,
  SortEntry,
} from './typeExtensions';

export type ConnectorSelectionListLayoutProps = {
  connectorsApiBasePath: string;
  connectorTypesLoading: boolean;
  currentSort: ConnectorTypesOrderBy;
  getToken: () => Promise<string>;
  initialSet: Array<FeaturedConnectorType> | undefined;
  labels?: Array<ConnectorTypeLabelCount>;
  noFilterResults: boolean;
  orderBy: ConnectorTypesOrderBy;
  rowHeight?: number;
  search: ConnectorTypesSearch;
  searchFieldPlaceholder: string;
  searchFieldValue: string;
  selectedCategories: Array<string>;
  selectedPricingTier: string;
  size: number;
  sortInputEntries: Array<SortEntry>;
  total: number;
  onChangeLabelFilter: (value: Array<string>) => void;
  onChangeSearchField: (value: string) => void;
  onChangeSort: (column: string) => void;
  onResetAllFilters: () => void;
  onChangePricingTierFilter: (value: string) => void;
  onAdjustViewportHeight: (
    dimensions: Dimensions,
    viewportEl: HTMLElement
  ) => void;
  renderSelector: (
    renderSelectionList: (props: {
      selectedId: string | undefined;
      onSelect: (connector: ConnectorTypeAllOf) => void;
    }) => ReactElement
  ) => ReactElement;
};
export const ConnectorSelectionListLayout: FC<
  ConnectorSelectionListLayoutProps
> = ({
  connectorsApiBasePath,
  connectorTypesLoading,
  currentSort,
  getToken,
  initialSet,
  labels,
  noFilterResults,
  orderBy,
  rowHeight = 118,
  search,
  searchFieldPlaceholder,
  searchFieldValue,
  selectedCategories = [],
  selectedPricingTier,
  size,
  sortInputEntries,
  total,
  onAdjustViewportHeight,
  onChangeLabelFilter,
  onChangePricingTierFilter,
  onChangeSearchField,
  onChangeSort,
  onResetAllFilters,
  renderSelector,
}) => {
  const currentCategory =
    selectedCategories.filter(
      (category) => category !== 'source' && category !== 'sink'
    )[0] || 'All Items';
  return (
    <>
      <Sidebar hasNoBackground tabIndex={0}>
        <SidebarPanel>
          <ViewportProvider>
            <ConnectorSelectionListFilterPanel
              id={'connector-selection-list-filter-panel'}
              labels={labels}
              currentCategory={currentCategory}
              selectedCategories={selectedCategories}
              onChangeLabelFilter={onChangeLabelFilter}
              selectedPricingTier={selectedPricingTier}
              onChangePricingTierFilter={onChangePricingTierFilter}
              onAdjustViewportHeight={onAdjustViewportHeight}
            />
          </ViewportProvider>
        </SidebarPanel>
        <SidebarContent className={'connector-selection-list__sidebar-content'}>
          <Stack>
            <StackItem key={'toolbar'}>
              <ConnectorSelectionListToolbar
                total={total}
                searchFieldValue={searchFieldValue}
                searchFieldPlaceholder={searchFieldPlaceholder}
                onChangeSearchField={onChangeSearchField}
                sortInputEntries={sortInputEntries}
                currentSort={currentSort}
                onChangeSort={onChangeSort}
                currentCategory={currentCategory}
                loading={connectorTypesLoading}
              />
            </StackItem>
            <StackItem key={'viewport'} isFilled>
              {(() => {
                switch (true) {
                  case connectorTypesLoading:
                    return <Loading />;
                  case noFilterResults:
                    return (
                      <EmptyStateNoMatchesFound onClear={onResetAllFilters} />
                    );
                  default:
                    return (
                      <ConnectorSelectionListCacheProvider
                        connectorsApiBasePath={connectorsApiBasePath}
                        getToken={getToken}
                        search={search}
                        orderBy={orderBy}
                        initialSet={initialSet}
                        size={size}
                        total={total}
                      >
                        {renderSelector(({ selectedId, onSelect }) => {
                          return ConnectorSelectionListInner({
                            selectedId,
                            total,
                            onAdjustViewportHeight,
                            rowHeight,
                            onSelect,
                          });
                        })}
                      </ConnectorSelectionListCacheProvider>
                    );
                }
              })()}
            </StackItem>
          </Stack>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

function ConnectorSelectionListInner({
  selectedId,
  total,
  onAdjustViewportHeight,
  rowHeight,
  onSelect,
}: {
  selectedId: string | undefined;
  total: number;
  onAdjustViewportHeight: (
    dimensions: Dimensions,
    viewportEl: HTMLElement
  ) => void;
  rowHeight: number;
  onSelect: (connector: ConnectorTypeAllOf) => void;
}) {
  return (
    <ViewportProvider>
      <ConnectorSelectionListViewport
        id={'connector-selection-list-viewport'}
        total={total}
        onAdjustViewportHeight={onAdjustViewportHeight}
        rowHeight={rowHeight}
        renderConnectorTypeLoading={({ key, style }) => (
          <ConnectorSelectionListSkeleton
            key={key}
            style={style}
            rowHeight={rowHeight}
          />
        )}
        renderConnectorType={({ connector, key, style }) => (
          <ConnectorSelectionListItem
            key={key}
            id={connector.id!}
            labels={connector.labels!}
            title={connector.name!}
            version={connector.version!}
            description={connector.description!}
            pricingTier={
              connector.annotations
                ? connector.annotations['cos.bf2.org/pricing-tier']
                : ''
            }
            style={style}
          />
        )}
        renderInnerScrollContainer={({ getRowById, ...props }) => (
          <DataList
            {...props}
            selectedDataListItemId={selectedId}
            onSelectDataListItem={(id) => {
              const connector = getRowById({ id });
              if (connector) {
                onSelect(connector as ConnectorTypeAllOf);
              }
            }}
          />
        )}
      />
    </ViewportProvider>
  );
}
