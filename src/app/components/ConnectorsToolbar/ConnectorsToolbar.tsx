import { ConnectorsOrderBy, ConnectorsSearch } from '@apis/api';
import { PaginationProps } from '@app/components/Pagination/Pagination';
import React, { FunctionComponent, ReactNode, useState } from 'react';
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

type ConnectorsToolbarProps = {
  children?: ReactNode;
};

export const ConnectorsToolbar: FunctionComponent<ConnectorsToolbarProps> = ({
  children,
}) => (
  <div className="pf-u-p-md">
    <div className="pf-c-scroll-outer-wrapper">
      <Toolbar>
        <ToolbarContent>{children}</ToolbarContent>
      </Toolbar>
    </div>
  </div>
);

type ConnectorsToolbarFilterProps = {} & PaginationProps<
  ConnectorsOrderBy,
  ConnectorsSearch
>;
export const ConnectorsToolbarFilter: FunctionComponent<ConnectorsToolbarFilterProps> =
  ({ perPage, onChange, orderBy, search }) => {
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
    return (
      <>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
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
      </>
    );
  };
