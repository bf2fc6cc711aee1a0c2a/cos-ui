import { ConnectorTypesOrderBy } from '@apis/api';
import { SearchFilter } from '@app/components/SearchFilter/SearchFilter';
import { validateConnectorSearchField } from '@utils/shared';
import React, { FC, useCallback } from 'react';

import {
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
  TextContent,
  TextVariants,
  ToolbarGroup,
  ToolbarFilter,
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
  const clearAllFilters = useCallback(() => onChangeSearchField(''), []);

  const onDeleteQueryGroup = (_: string) => {
    onChangeSearchField('');
  };
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
          <ToolbarFilter
            chips={searchFieldValue ? [searchFieldValue] : []}
            deleteChip={() => onDeleteQueryGroup(searchFieldValue)}
            categoryName={t('connector')}
          >
            <SearchFilter
              onChangeSearchField={onChangeSearchField}
              placeholder={searchFieldPlaceholder}
              SearchFieldName={'connector'}
              validateFilterRegex={validateConnectorSearchField}
            />
          </ToolbarFilter>
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
    <Toolbar
      id="toolbar-group-types"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={clearAllFilters}
    >
      <ToolbarContent className={'pf-m-no-padding'}>
        {toolbarItems}
      </ToolbarContent>
    </Toolbar>
  );
};
