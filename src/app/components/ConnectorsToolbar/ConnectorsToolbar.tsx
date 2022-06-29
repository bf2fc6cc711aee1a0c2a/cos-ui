import { ConnectorsOrderBy, ConnectorsSearch } from '@apis/api';
import {
  Pagination,
  PaginationProps,
} from '@app/components/Pagination/Pagination';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import {
  Button,
  InputGroup,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

type ConnectorsToolbarProps = {} & PaginationProps<
  ConnectorsOrderBy,
  ConnectorsSearch
>;
export const ConnectorsToolbar: FunctionComponent<ConnectorsToolbarProps> = ({
  itemCount,
  page,
  perPage,
  onChange,
  orderBy,
  search,
}) => {
  const { t } = useTranslation();
  // this is until we add a search field selector for other fields
  const initialName = search ? search.name || '' : '';
  const [name, setName] = useState<string>(initialName);
  const runQuery = () => {
    onChange({
      page: 1,
      size: perPage,
      orderBy,
      search: {
        name,
      },
    });
  };
  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <InputGroup>
          <TextInput
            name="name"
            id="name"
            type="search"
            aria-label="filter by connector name"
            value={`${name}`}
            ouiaId={'search-field'}
            onChange={setName}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                runQuery();
              }
            }}
          />
          <Button
            variant={'control'}
            aria-label="search button for search input"
            onClick={runQuery}
            ouiaId={'button-search'}
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
    </>
  );

  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <NavLink
            className="pf-c-button pf-m-primary"
            to={'/create-connector'}
            data-ouia-component-id={'button-create'}
          >
            {t('createConnectorsInstance')}
          </NavLink>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <Pagination
          itemCount={itemCount}
          page={page}
          perPage={perPage}
          onChange={(event) =>
            onChange({
              ...event,
              orderBy: orderBy,
              search: search,
            })
          }
          isCompact={true}
        />
      </ToolbarItem>
    </>
  );

  return (
    <Toolbar
      id="toolbar-group-types"
      collapseListedFiltersBreakpoint="xl"
      className={'pf-u-p-md'}
    >
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
};
