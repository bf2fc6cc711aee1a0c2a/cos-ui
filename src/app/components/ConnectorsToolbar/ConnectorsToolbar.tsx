import {
  Pagination,
  PaginationProps,
} from '@app/components/Pagination/Pagination';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import {
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

type ConnectorsToolbarProps = {} & PaginationProps;
export const ConnectorsToolbar: FunctionComponent<ConnectorsToolbarProps> = ({
  itemCount,
  page,
  perPage,
  onChange,
}) => {
  const { t } = useTranslation();
  const toolbarItems = (
    <>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <NavLink
            className="pf-c-button pf-m-primary"
            to={'/create-connector'}
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
          onChange={onChange}
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
