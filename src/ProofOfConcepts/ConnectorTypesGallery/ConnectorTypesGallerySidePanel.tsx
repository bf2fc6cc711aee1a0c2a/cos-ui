import React, { FC, useState } from 'react';

import {
  FilterSidePanel,
  FilterSidePanelCategory,
  FilterSidePanelCategoryItem,
  VerticalTabs,
  VerticalTabsTab,
} from '@patternfly/react-catalog-view-extension';
import {
  Popover,
  SearchInput,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import { Loading } from '@rhoas/app-services-ui-components';

import { ConnectorTypeLabelCount } from './typeExtensions';

export type ConnectorTypesGallerySidePanelProps = {
  labels?: Array<ConnectorTypeLabelCount>;
  currentCategory: string;
  searchFieldValue: string;
  searchFieldPlaceholder: string;
  onChangeSearchField: (value: string) => void;
  selectedCategories: Array<string>;
  onChangeLabelFilter: (value: Array<string>) => void;
};
export const ConnectorTypesGallerySidePanel: FC<ConnectorTypesGallerySidePanelProps> =
  ({
    currentCategory,
    labels,
    searchFieldValue,
    searchFieldPlaceholder,
    onChangeSearchField,
    selectedCategories = [],
    onChangeLabelFilter,
  }) => {
    const [currentSearch, setCurrentSearch] = useState(searchFieldValue);
    const typeLabels = selectedCategories.filter(
      (category) => category !== currentCategory
    );
    const isSinkChecked =
      typeLabels.find((cat) => cat === 'sink') !== undefined;
    const isSourceChecked =
      typeLabels.find((cat) => cat === 'source') !== undefined;
    return (
      <FilterSidePanel>
        <FilterSidePanelCategory key={'search-input'} showAll={true}>
          <SearchInput
            name="name"
            id="name"
            type="search"
            aria-label="filter by connector name"
            className={'connector-types-gallery__search-input'}
            onChange={setCurrentSearch}
            onClear={() => {
              setCurrentSearch('');
              onChangeSearchField('');
            }}
            value={currentSearch}
            onSearch={() => onChangeSearchField(currentSearch)}
            placeholder={searchFieldPlaceholder}
          />
        </FilterSidePanelCategory>
        <FilterSidePanelCategory key={'category-nav'} showAll={true}>
          <VerticalTabs className={'connector-types-gallery__vertical-tabs'}>
            <VerticalTabsTab
              key="all"
              active={currentCategory === ''}
              onClick={() => onChangeLabelFilter(typeLabels)}
              title={'All Items'}
            />
            {labels ? (
              labels.map(({ label, count }) => (
                <VerticalTabsTab
                  key={label}
                  active={
                    selectedCategories.find((cat) => cat === label) !==
                    undefined
                  }
                  onClick={() => onChangeLabelFilter([label, ...typeLabels])}
                  title={`${label} (${count})`}
                />
              ))
            ) : (
              <Loading />
            )}
          </VerticalTabs>
        </FilterSidePanelCategory>
        <FilterSidePanelCategory
          key={'type-category'}
          title={
            <>
              Type&nbsp;&nbsp;
              <Popover
                position="right"
                bodyContent={
                  <TextContent>
                    <Text component={TextVariants.h5}>Type</Text>
                    <Text component={TextVariants.h6}>Source connector</Text>
                    <Text component={TextVariants.p}>
                      Ingests data from another system into a Kafka instance.
                    </Text>
                    <Text component={TextVariants.h6}>Sink connector</Text>
                    <Text component={TextVariants.p}>
                      Propagates data from a Kafka instance into another system.
                    </Text>
                  </TextContent>
                }
              >
                <OutlinedQuestionCircleIcon color="grey" />
              </Popover>
            </>
          }
        >
          <FilterSidePanelCategoryItem
            key="source"
            checked={isSourceChecked}
            onClick={() =>
              isSourceChecked
                ? onChangeLabelFilter([
                    ...selectedCategories.filter((label) => label !== 'source'),
                  ])
                : onChangeLabelFilter([
                    ...selectedCategories.filter((label) => label !== 'sink'),
                    'source',
                  ])
            }
          >
            Source
          </FilterSidePanelCategoryItem>
          <FilterSidePanelCategoryItem
            key="sink"
            checked={isSinkChecked}
            onClick={() =>
              isSinkChecked
                ? onChangeLabelFilter([
                    ...selectedCategories.filter((label) => label !== 'sink'),
                  ])
                : onChangeLabelFilter([
                    ...selectedCategories.filter((label) => label !== 'source'),
                    'sink',
                  ])
            }
          >
            Sink
          </FilterSidePanelCategoryItem>
        </FilterSidePanelCategory>
      </FilterSidePanel>
    );
  };
