import { ConnectorTypesOrderBy } from '@apis/api';
import { Loading } from '@app/components/Loading/Loading';
import React, { FC } from 'react';
import { ViewportProvider } from 'react-viewport-utils';

import {
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { ConnectorSelectionListFilterPanel } from './ConnectorSelectionListFilterPanel';
import { ConnectorSelectionListItem } from './ConnectorSelectionListItem';
import './ConnectorSelectionListLayout.css';
import { ConnectorSelectionListToolbar } from './ConnectorSelectionListToolbar';
import { ConnectorSelectionListViewport } from './ConnectorSelectionListViewport';
import { ConnectorTypesGalleryCardSkeleton } from './ConnectorTypesGalleryCardSkeleton';
import { ConnectorTypeLabelCount, SortEntry } from './typeExtensions';

type ConnectorSelectionListLayoutProps = {
  connectorTypesLoading: boolean;
  labels?: Array<ConnectorTypeLabelCount>;
  total: number;
  sortInputEntries: Array<SortEntry>;
  currentSort: ConnectorTypesOrderBy;
  onChangeSort: (column: string) => void;
  searchFieldValue: string;
  searchFieldPlaceholder: string;
  onChangeSearchField: (value: string) => void;
  selectedCategories: Array<string>;
  onChangeLabelFilter: (value: Array<string>) => void;
};
export const ConnectorSelectionListLayout: FC<ConnectorSelectionListLayoutProps> =
  ({
    connectorTypesLoading,
    labels,
    sortInputEntries,
    total,
    currentSort,
    onChangeSort,
    searchFieldValue,
    searchFieldPlaceholder,
    onChangeSearchField,
    selectedCategories = [],
    onChangeLabelFilter,
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
              />
            </ViewportProvider>
          </SidebarPanel>
          <SidebarContent
            className={'connector-selection-list__sidebar-content'}
          >
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
                {!connectorTypesLoading ? (
                  <ViewportProvider>
                    <ConnectorSelectionListViewport
                      id={'connector-selection-list-viewport'}
                      total={total}
                      renderConnectorTypeLoading={() => (
                        <ConnectorTypesGalleryCardSkeleton />
                      )}
                      renderConnectorType={({
                        id,
                        labels,
                        name,
                        description,
                        version,
                      }) => (
                        <ConnectorSelectionListItem
                          key={id}
                          id={id!}
                          labels={labels!}
                          title={name!}
                          version={version!}
                          description={description!}
                        />
                      )}
                    />
                  </ViewportProvider>
                ) : (
                  <Loading />
                )}
              </StackItem>
            </Stack>
          </SidebarContent>
        </Sidebar>
      </>
    );
  };
