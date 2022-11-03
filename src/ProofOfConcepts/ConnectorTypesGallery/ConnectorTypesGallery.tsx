import { ConnectorTypesOrderBy } from '@apis/api';
import React, { FC } from 'react';

import {
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
} from '@patternfly/react-core';

import { Loading } from '@rhoas/app-services-ui-components';

import './ConnectorTypesGallery.css';
import { ConnectorTypesGalleryCard } from './ConnectorTypesGalleryCard';
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
  const currentCategory =
    selectedCategories.filter(
      (category) => category !== 'source' && category !== 'sink'
    )[0] || 'All Items';
  return (
    <>
      <PageSection>
        <Sidebar hasGutter tabIndex={0}>
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
          <SidebarContent>
            <ConnectorTypesGalleryToolbar
              total={total}
              sortInputEntries={sortInputEntries}
              currentSort={currentSort}
              onChangeSort={onChangeSort}
              currentCategory={currentCategory}
            />
            {connectorTypes ? (
              <ConnectorTypesGalleryViewport
                id={'connector-type-gallery-scroller'}
                total={total}
                renderConnectorTypeLoading={() => <Loading />}
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
                  />
                )}
              />
            ) : (
              <Loading />
            )}
          </SidebarContent>
        </Sidebar>
      </PageSection>
    </>
  );
};
