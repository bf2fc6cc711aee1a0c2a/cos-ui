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
  ToolbarGroup,
  SearchInput,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

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
  currentCategory,
  loading,
  total,
  searchFieldPlaceholder,
  searchFieldValue,
  onChangeSearchField,
}) => {
  const { t } = useTranslation();
  const [currentSearch, setCurrentSearch] = useState(searchFieldValue);
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
            onChange={(_, value) => setCurrentSearch(value)}
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
    </>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
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
