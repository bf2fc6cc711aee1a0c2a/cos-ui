import { ConnectorTypesOrderBy } from '@apis/api';
import React, { FC } from 'react';

import {
  Gallery,
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { Loading } from '@rhoas/app-services-ui-components';

import './ConnectorTypesGallery.css';
import { ConnectorTypesGalleryCard } from './ConnectorTypesGalleryCard';
import { ConnectorTypesGallerySidePanel } from './ConnectorTypesGallerySidePanel';
import { ConnectorTypesGalleryToolbar } from './ConnectorTypesGalleryToolbar';
import {
  ConnectorTypeLabelCount,
  FeaturedConnectorType,
  SortEntry,
} from './typeExtensions';

type ConnectorTypesGalleryProps = {
  connectorTypes?: Array<FeaturedConnectorType>;
  labels?: Array<ConnectorTypeLabelCount>;
  page: number;
  size: number;
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
  page,
  size,
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
  console.log('Page: ', page, ' size: ', size, ' total: ', total);
  const currentCategory =
    selectedCategories.filter(
      (category) => category !== 'source' && category !== 'sink'
    )[0] || '';
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
            <Stack>
              <StackItem>
                <ConnectorTypesGalleryToolbar
                  total={total}
                  sortInputEntries={sortInputEntries}
                  currentSort={currentSort}
                  onChangeSort={onChangeSort}
                  currentCategory={currentCategory}
                />
              </StackItem>
              <StackItem isFilled>
                {connectorTypes ? (
                  <Gallery hasGutter>
                    {connectorTypes.map(
                      ({
                        id,
                        labels,
                        name,
                        description,
                        version,
                        featured_rank,
                      }) => (
                        <ConnectorTypesGalleryCard
                          key={id}
                          id={id!}
                          labels={labels!}
                          name={name!}
                          description={description!}
                          version={version!}
                          selectedId={undefined}
                          featuredRank={featured_rank}
                          onSelect={(id: string) => {
                            console.log('onSelect: ', id);
                          }}
                        />
                      )
                    )}
                  </Gallery>
                ) : (
                  <Loading />
                )}
              </StackItem>
            </Stack>
          </SidebarContent>
        </Sidebar>
      </PageSection>
    </>
  );
};
