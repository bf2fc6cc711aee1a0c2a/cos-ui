import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Gallery,
  InputGroup,
  Pagination,
  Select,
  SelectOption,
  TextInput,
  Toolbar,
  ToolbarChip,
  ToolbarChipGroup,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { BodyLayout } from './BodyLayout';
import {
  useConnectorTypesMachine,
  useConnectorTypesMachineIsReady,
} from './CreateConnectorWizardContext';
import { EmptyState, EmptyStateVariant } from './EmptyState';
import { Loading } from './Loading';
import { NoMatchFound } from './NoMatchFound';
import { defaultPerPageOptions } from './constants';
import { stringToChip } from './stringToChip';
import { useDebounce } from './useDebounce';

export function SelectConnectorType() {
  const isReady = useConnectorTypesMachineIsReady();

  return isReady ? <ConnectorTypesGallery /> : null;
}

export function ConnectorTypesGallery() {
  const { t } = useTranslation();
  const {
    response,
    loading,
    error,
    noResults,
    // results,
    queryEmpty,
    // queryResults,
    firstRequest,
    selectedId,
    onSelect,
    onQuery,
  } = useConnectorTypesMachine();

  return (
    <BodyLayout
      title={t('Connector category')}
      description={
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit error adipisci, ducimus ipsum dicta quo beatae ratione aliquid nostrum animi eos, doloremque laborum quasi sed, vitae ipsa illo delectus! Quos'
      }
    >
      {(() => {
        switch (true) {
          case firstRequest:
            return <Loading />;
          case queryEmpty:
            return (
              <>
                <ConnectorTypesToolbar />
                <NoMatchFound onClear={() => onQuery({ page: 1, size: 10 })} />
              </>
            );
          case noResults || error:
            return (
              <EmptyState
                emptyStateProps={{ variant: EmptyStateVariant.GettingStarted }}
                titleProps={{ title: 'cos.no_connector_types' }}
                emptyStateBodyProps={{
                  body: 'cos.no_connector_types_body',
                }}
              />
            );
          case loading:
            return (
              <>
                <ConnectorTypesToolbar />
                <Loading />
              </>
            );
          default:
            return (
              <>
                <ConnectorTypesToolbar />
                <div className={'pf-l-stack__item pf-m-fill pf-u-p-md'}>
                  <Gallery hasGutter>
                    {response?.items?.map((c) => (
                      <Card
                        isHoverable
                        key={c.id}
                        isSelectable
                        isSelected={selectedId === c.id}
                        onClick={() => onSelect(c.id!)}
                      >
                        <CardHeader>
                          <CardTitle>{c.name}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListDescription>
                                {c.description}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>Version</DescriptionListTerm>
                              <DescriptionListDescription>
                                {c.version}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>ID</DescriptionListTerm>
                              <DescriptionListDescription>
                                {c.id}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
                    ))}
                  </Gallery>
                </div>
                <ConnectorTypesPagination />
              </>
            );
        }
      })()}
    </BodyLayout>
  );
}

const ConnectorTypesToolbar: FunctionComponent = () => {
  const { t } = useTranslation();
  const { request, onQuery } = useConnectorTypesMachine();
  const [categoriesToggled, setCategoriesToggled] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(onQuery, 1000);

  const { name, categories = [] } = request.query || {};

  const clearAllFilters = useCallback(
    () => onQuery({ page: 1, size: request.size }),
    [onQuery, request.size]
  );

  const toggleCategories = useCallback(
    () => setCategoriesToggled((prev) => !prev),
    []
  );

  const onSelectFilter = (category: string, values: string[], value: string) =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        [category]: values.includes(value)
          ? values.filter((s) => s !== value)
          : [...(values || []), value],
      },
    });

  const onSelectCategory = (
    _category: string | ToolbarChipGroup,
    value: string | ToolbarChip
  ) => {
    onSelectFilter('categories', categories, (value as ToolbarChip).key);
  };

  const onDeleteQueryGroup = (category: string) =>
    onQuery({
      ...request,
      query: {
        ...(request.query || {}),
        [category]: undefined,
      },
    });

  // ensure the search input value reflects what's specified in the request object
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = name || '';
    }
  }, [nameInputRef, name]);

  const typeMenuItems = [
    <SelectOption key="sink" value="sink">
      {t('sink')}
    </SelectOption>,
    <SelectOption key="source" value="source">
      {t('source')}
    </SelectOption>,
  ];
  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <InputGroup>
          <TextInput
            name="name"
            id="name"
            type="search"
            aria-label="filter by connector name"
            onChange={(name) =>
              debouncedOnQuery({
                size: request.size,
                page: 1,
                query: {
                  ...request.query,
                  name,
                },
              })
            }
            ref={nameInputRef}
          />
          <Button
            variant={'control'}
            aria-label="search button for search input"
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={categories.map((v) => stringToChip(v, t))}
          deleteChip={onSelectCategory}
          deleteChipGroup={() => onDeleteQueryGroup('categories')}
          categoryName="Connector type"
        >
          <Select
            variant={'checkbox'}
            aria-label="Connector type"
            onToggle={toggleCategories}
            onSelect={(_, v) =>
              onSelectCategory('', stringToChip(v as string, t))
            }
            selections={categories}
            isOpen={categoriesToggled}
            placeholderText="Connector type"
          >
            {typeMenuItems}
          </Select>
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <ConnectorTypesPagination isCompact />
      </ToolbarItem>
    </>
  );
  return (
    <Toolbar
      id="toolbar-group-types"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={clearAllFilters}
    >
      <ToolbarContent>{toolbarItems}</ToolbarContent>
    </Toolbar>
  );
};

type ConnectorTypesPaginationProps = {
  isCompact?: boolean;
};
const ConnectorTypesPagination: FunctionComponent<ConnectorTypesPaginationProps> =
  ({ isCompact = false }) => {
    const { request, response, onQuery } = useConnectorTypesMachine();
    return (
      <Pagination
        itemCount={response?.total || 0}
        page={request.page}
        perPage={request.size}
        perPageOptions={defaultPerPageOptions}
        onSetPage={(_, page, size) =>
          onQuery({ ...request, page, size: size || request.size })
        }
        onPerPageSelect={() => false}
        variant={isCompact ? 'top' : 'bottom'}
        isCompact={isCompact}
      />
    );
  };
