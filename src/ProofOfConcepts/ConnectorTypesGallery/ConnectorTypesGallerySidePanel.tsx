import React, { FC, useState } from 'react';
import { useDimensionsEffect } from 'react-viewport-utils';

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

import { Loading, useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorTypesGallerySidePanel.css';
import { ConnectorTypeLabelCount } from './typeExtensions';

export type ConnectorTypesGallerySidePanelProps = {
  labels?: Array<ConnectorTypeLabelCount>;
  id: string;
  currentCategory: string;
  searchFieldValue: string;
  searchFieldPlaceholder: string;
  onChangeSearchField: (value: string) => void;
  selectedCategories: Array<string>;
  onChangeLabelFilter: (value: Array<string>) => void;
};
export const ConnectorTypesGallerySidePanel: FC<ConnectorTypesGallerySidePanelProps> =
  ({
    id,
    currentCategory,
    labels,
    searchFieldValue,
    searchFieldPlaceholder,
    onChangeSearchField,
    selectedCategories = [],
    onChangeLabelFilter,
  }) => {
    const { t } = useTranslation();
    const loading = typeof labels === 'undefined';
    const [currentSearch, setCurrentSearch] = useState(searchFieldValue);
    const typeLabels = selectedCategories.filter(
      (category) => category !== currentCategory
    );
    const isSinkChecked =
      typeLabels.find((cat) => cat === 'sink') !== undefined;
    const isSourceChecked =
      typeLabels.find((cat) => cat === 'source') !== undefined;
    const searchBoxId = `${id}-search`;
    useDimensionsEffect((dimensions) => {
      const scrollableElement = document.getElementById(id);
      const searchBox = document.getElementById(searchBoxId);
      const top = scrollableElement!.offsetTop + 20 + searchBox!.offsetHeight;
      scrollableElement!.style.height = `${dimensions.height - top}px`;
    });
    return (
      <FilterSidePanel>
        <FilterSidePanelCategory
          id={searchBoxId}
          className={'connector-types-gallery__side-panel-search-container'}
          key={'search-input'}
        >
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
            isDisabled={loading}
          />
        </FilterSidePanelCategory>
        <div id={id} className={'connector-types-gallery__side-panel-viewport'}>
          <FilterSidePanelCategory key={'category-nav'}>
            {!loading ? (
              <VerticalTabs
                className={'connector-types-gallery__vertical-tabs'}
              >
                <VerticalTabsTab
                  key="all"
                  active={currentCategory === 'All Items'}
                  onClick={() => onChangeLabelFilter(typeLabels)}
                  title={t('All Items')}
                />
                {labels!
                  .filter(({ label }) => label !== 'Featured')
                  .map(({ label, count }) => (
                    <VerticalTabsTab
                      key={label}
                      active={
                        selectedCategories.find((cat) => cat === label) !==
                        undefined
                      }
                      onClick={() =>
                        onChangeLabelFilter([label, ...typeLabels])
                      }
                      title={`${t(label)} (${count})`}
                    />
                  ))}
              </VerticalTabs>
            ) : (
              <Loading />
            )}
          </FilterSidePanelCategory>
          {!loading && (
            <FilterSidePanelCategory
              key={'type-category'}
              title={
                <>
                  {t('Type')}&nbsp;&nbsp;
                  <Popover
                    position="right"
                    bodyContent={
                      <TextContent>
                        <Text component={TextVariants.h5}>{t('Type')}</Text>
                        <Text component={TextVariants.h6}>
                          {t('Source connector')}
                        </Text>
                        <Text component={TextVariants.p}>
                          {t('shortDescriptionSource')}
                        </Text>
                        <Text component={TextVariants.h6}>Sink connector</Text>
                        <Text component={TextVariants.p}>
                          {t('shortDescriptionSink')}
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
                        ...selectedCategories.filter(
                          (label) => label !== 'source'
                        ),
                      ])
                    : onChangeLabelFilter([
                        ...selectedCategories.filter(
                          (label) => label !== 'sink'
                        ),
                        'source',
                      ])
                }
              >
                {t('Source')}
              </FilterSidePanelCategoryItem>
              <FilterSidePanelCategoryItem
                key="sink"
                checked={isSinkChecked}
                onClick={() =>
                  isSinkChecked
                    ? onChangeLabelFilter([
                        ...selectedCategories.filter(
                          (label) => label !== 'sink'
                        ),
                      ])
                    : onChangeLabelFilter([
                        ...selectedCategories.filter(
                          (label) => label !== 'source'
                        ),
                        'sink',
                      ])
                }
              >
                {t('Sink')}
              </FilterSidePanelCategoryItem>
            </FilterSidePanelCategory>
          )}
        </div>
      </FilterSidePanel>
    );
  };
