import { ConnectorTypesOrderBy } from '@apis/api';
import { Loading } from '@app/components/Loading/Loading';
import React, { FC } from 'react';

import { Sidebar, SidebarContent, SidebarPanel } from '@patternfly/react-core';

import './ConnectorTypesGallery.css';
import { useConnectorTypesGalleryCache } from './ConnectorTypesGalleryCache';
import { ConnectorTypesGalleryCard } from './ConnectorTypesGalleryCard';
import { ConnectorTypesGalleryCardSkeleton } from './ConnectorTypesGalleryCardSkeleton';
import { ConnectorTypesGallerySidePanel } from './ConnectorTypesGallerySidePanel';
import { ConnectorTypesGalleryToolbar } from './ConnectorTypesGalleryToolbar';
import { ConnectorTypesGalleryViewport } from './ConnectorTypesGalleryViewport';
import {
  ConnectorTypeLabelCount,
  FeaturedConnectorType,
  SortEntry,
} from './typeExtensions';

type ConnectorTypesGalleryProps = {
  connectorTypes?: Array<FeaturedConnectorType>;
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
  connectorTypes,
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
  const { useMasonry } = useConnectorTypesGalleryCache();
  const loading = typeof connectorTypes === 'undefined';
  const currentCategory =
    selectedCategories.filter(
      (category) => category !== 'source' && category !== 'sink'
    )[0] || 'All Items';
  return (
    <>
      <Sidebar hasNoBackground tabIndex={0}>
        <SidebarPanel variant={'sticky'}>
          <ConnectorTypesGallerySidePanel
            labels={labels}
            currentCategory={currentCategory}
            searchFieldValue={searchFieldValue}
            searchFieldPlaceholder={searchFieldPlaceholder}
            onChangeSearchField={onChangeSearchField}
            selectedCategories={selectedCategories}
            onChangeLabelFilter={onChangeLabelFilter}
          />
        </SidebarPanel>
        <SidebarContent className={'connector-type-gallery__sidebar-content'}>
          <ConnectorTypesGalleryToolbar
            total={total}
            sortInputEntries={sortInputEntries}
            currentSort={currentSort}
            onChangeSort={onChangeSort}
            currentCategory={currentCategory}
            loading={loading}
          />
          {!loading ? (
            <ConnectorTypesGalleryViewport
              id={'connector-type-gallery-scroller'}
              total={total}
              renderConnectorTypeLoading={() => (
                <ConnectorTypesGalleryCardSkeleton useMasonry={useMasonry} />
              )}
              renderConnectorType={({
                id,
                labels,
                name,
                description,
                version,
                featuredRank,
              }) => (
                <ConnectorTypesGalleryCard
                  key={id}
                  id={id!}
                  labels={labels!}
                  name={name!}
                  description={description!}
                  version={version!}
                  selectedId={undefined}
                  featuredRank={featuredRank}
                  onSelect={(id: string) => {
                    console.log('onSelect: ', id);
                  }}
                  useMasonry={useMasonry}
                />
              )}
            />
          ) : (
            <Loading />
          )}
        </SidebarContent>
      </Sidebar>
    </>
  );
};
