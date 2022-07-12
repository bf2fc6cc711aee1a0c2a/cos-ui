import React, { FunctionComponent } from 'react';

import { Pagination as PFPagination } from '@patternfly/react-core';

import './Pagination.css';

export type PaginationEvent<OrderBy, Search> = {
  page: number;
  size: number;
  orderBy?: OrderBy;
  search?: Search;
};

export type PaginationProps<OrderBy, Search> = {
  itemCount: number;
  page: number;
  perPage: number;
  isCompact?: boolean;
  onChange: (event: PaginationEvent<OrderBy, Search>) => void;
  orderBy?: OrderBy;
  search?: Search;
};
export const Pagination: FunctionComponent<PaginationProps<object, object>> = ({
  itemCount,
  page,
  perPage,
  isCompact = false,
  onChange,
}) => {
  const defaultPerPageOptions = [
    {
      title: '1',
      value: 1,
    },
    {
      title: '5',
      value: 5,
    },
    {
      title: '10',
      value: 10,
    },
    {
      title: '20',
      value: 20,
    },
    {
      title: '50',
      value: 50,
    },
  ];
  return (
    <PFPagination
      className={'cos-ui-pagination'}
      itemCount={itemCount}
      page={page}
      perPage={perPage}
      perPageOptions={defaultPerPageOptions}
      onSetPage={(_, page) => onChange({ page, size: perPage })}
      onPerPageSelect={(_, perPage) => onChange({ page: 1, size: perPage })}
      variant={isCompact ? 'top' : 'bottom'}
      isCompact={isCompact}
    />
  );
};
