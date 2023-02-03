import { ConnectorTypesOrderBy } from '@apis/api';
import { ConnectorFilter } from '@app/pages/CreateConnectorPage/components/ConnectorFilter';
import React, { FC } from 'react';

import {
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
  TextContent,
  TextVariants,
  ToolbarGroup,
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
          <ConnectorFilter
            onChangeSearchField={onChangeSearchField}
            loading={loading}
            searchFieldPlaceholder={searchFieldPlaceholder}
            total={total}
            searchFieldValue={searchFieldValue}
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
