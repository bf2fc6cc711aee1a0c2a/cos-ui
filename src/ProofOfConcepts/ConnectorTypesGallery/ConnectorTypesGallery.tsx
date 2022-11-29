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

import './ConnectorTypesGallery.css';
import { ConnectorTypesGalleryCardSkeleton } from './ConnectorTypesGalleryCardSkeleton';
import { ConnectorTypesGallerySidePanel } from './ConnectorTypesGallerySidePanel';
import { ConnectorTypesGalleryToolbar } from './ConnectorTypesGalleryToolbar';
import { ConnectorTypesGalleryViewport } from './ConnectorTypesGalleryViewport';
import { ConnectorTypeListItem } from './ConnectorTypesListItem';
import { ConnectorTypeLabelCount, SortEntry } from './typeExtensions';

type ConnectorTypesGalleryProps = {
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
export const ConnectorTypesGallery: FC<ConnectorTypesGalleryProps> = ({
  connectorTypesLoading = true,
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
            <ConnectorTypesGallerySidePanel
              id={'connector-types-gallery-filter-panel'}
              labels={labels}
              currentCategory={currentCategory}
              searchFieldValue={searchFieldValue}
              searchFieldPlaceholder={searchFieldPlaceholder}
              onChangeSearchField={onChangeSearchField}
              selectedCategories={selectedCategories}
              onChangeLabelFilter={onChangeLabelFilter}
            />
          </ViewportProvider>
        </SidebarPanel>
        <SidebarContent className={'connector-types-gallery__sidebar-content'}>
          <Stack>
            <StackItem key={'toolbar'}>
              <ConnectorTypesGalleryToolbar
                total={total}
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
                  <ConnectorTypesGalleryViewport
                    id={'connector-types-gallery-viewport'}
                    total={total}
                    renderConnectorTypeLoading={() => (
                      <ConnectorTypesGalleryCardSkeleton />
                    )}
                    renderConnectorType={({ id, labels, name, version }) => (
                      <ConnectorTypeListItem
                        key={id}
                        id={id!}
                        labels={labels!}
                        title={name!}
                        verison={version!}
                        numLabels={10}
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
