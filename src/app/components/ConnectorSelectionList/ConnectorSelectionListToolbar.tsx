import { ConnectorTypesOrderBy } from '@apis/api';
import React, { FC, useState } from 'react';

import {
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
  TextContent,
  TextVariants,
  SelectVariant,
  ToolbarGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SearchInput,
} from '@patternfly/react-core';
import { ArrowsAltVIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorSelectionListToolbar.css';
import { SortEntry } from './typeExtensions';

export type ConnectorSelectionListToolbarProps = {
  loading: boolean;
  total: number;
  currentCategory: string;
  searchFieldPlaceholder: string;
  searchFieldValue: string;
  onChangeSearchField: (value: string) => void;
  sortInputEntries: Array<SortEntry>;
  currentSort: ConnectorTypesOrderBy;
  onChangeSort: (value: string) => void;
};
export const ConnectorSelectionListToolbar: FC<
  ConnectorSelectionListToolbarProps
> = ({
  currentSort,
  currentCategory,
  sortInputEntries,
  loading,
  total,
  searchFieldPlaceholder,
  searchFieldValue,
  onChangeSearchField,
  onChangeSort,
}) => {
  const { t } = useTranslation();
  const [currentSearch, setCurrentSearch] = useState(searchFieldValue);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const primarySort = [
    Object.keys(currentSort || {})[0] || sortInputEntries[0].value,
  ];
  const toggleGroupItems = (
    <>
      <ToolbarGroup variant={'button-group'}>
        <ToolbarItem>
          <TextContent>
            <Text
              className={'connector-selection-list__toolbar-category-title'}
              component={TextVariants.h3}
            >
              {t(currentCategory)}
            </Text>
          </TextContent>
        </ToolbarItem>
        <ToolbarItem variant={'search-filter'}>
          <SearchInput
            name="search-by-name"
            id="search-by-name"
            type="search"
            aria-label="filter by connector name"
            onChange={setCurrentSearch}
            onClear={() => {
              setCurrentSearch('');
              onChangeSearchField('');
            }}
            value={searchFieldValue}
            onSearch={() => onChangeSearchField(currentSearch)}
            placeholder={searchFieldPlaceholder}
            isDisabled={loading}
          />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup variant={'filter-group'}>
        <ToolbarItem>
          <Select
            isOpen={isSortOpen}
            variant={SelectVariant.single}
            aria-label={'sorting control'}
            onToggle={setIsSortOpen}
            onSelect={(_event, selection: SelectOptionObject | string) => {
              if (typeof selection === 'string') {
                onChangeSort(selection);
              } else {
                onChangeSort((selection as SelectOptionObject).toString());
              }
              setIsSortOpen(false);
            }}
            selections={primarySort}
            isDisabled={loading}
          >
            {sortInputEntries.map(({ value, label }, index) => (
              <SelectOption key={index} value={value}>
                {t(label)}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>
      </ToolbarGroup>
    </>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<ArrowsAltVIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      {!loading && (
        <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
          <TextContent>
            <Text component={TextVariants.p}>
              <b>{t('items', { count: total })}</b>
            </Text>
          </TextContent>
        </ToolbarItem>
      )}
    </>
  );
  return (
    <Toolbar id="toolbar-group-types" collapseListedFiltersBreakpoint="xl">
      <ToolbarContent className={'pf-m-no-padding'}>
        {toolbarItems}
      </ToolbarContent>
    </Toolbar>
  );
};
