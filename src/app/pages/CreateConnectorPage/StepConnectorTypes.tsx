import {
  useConnectorTypesMachine,
  useConnectorTypesMachineIsReady,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateGenericError } from '@app/components/EmptyStateGenericError/EmptyStateGenericError';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import { Pagination } from '@app/components/Pagination/Pagination';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { stringToChip } from 'src/utils/stringToChip';
import { useDebounce } from 'src/utils/useDebounce';

import {
  Alert,
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

import {
  ConnectorTypeAllOf,
  ObjectReference,
} from '@rhoas/connector-management-sdk';

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
    queryEmpty,
    duplicateMode,
    connectorTypeDetails,
    firstRequest,
    selectedId,
    onSelect,
    onQuery,
  } = useConnectorTypesMachine();
  return (
    <StepBodyLayout
      title={t('connector')}
      description={t('connectorTypeStepDescription')}
    >
      {(() => {
        switch (true) {
          case firstRequest:
            return <Loading />;
          case queryEmpty:
            return (
              <>
                <ConnectorTypesToolbar duplicateMode={duplicateMode} />
                <EmptyStateNoMatchesFound
                  onClear={() => onQuery({ page: 1, size: 10 })}
                />
              </>
            );
          case noResults || error:
            return <EmptyStateGenericError />;
          case loading:
            return (
              <>
                <ConnectorTypesToolbar duplicateMode={duplicateMode} />
                <Loading />
              </>
            );
          default:
            return (
              <>
                <ConnectorTypesToolbar duplicateMode={duplicateMode} />
                <div className={'pf-l-stack__item pf-m-fill'}>
                  {duplicateMode ? (
                    <>
                      <Alert
                        variant="info"
                        className="pf-u-mb-md"
                        isInline
                        title="Kafka instances and namespaces both expire after 48 hours. When duplicating a Connectors instance, select a new Kafka instance and namespace. "
                      />
                      <Gallery hasGutter>
                        <Card
                          key={(connectorTypeDetails as ObjectReference).id}
                          isSelectable
                          isSelected={
                            selectedId ===
                            (connectorTypeDetails as ObjectReference).id
                          }
                        >
                          <CardHeader>
                            <CardTitle>
                              {
                                (connectorTypeDetails as ConnectorTypeAllOf)
                                  .name
                              }
                            </CardTitle>
                          </CardHeader>
                          <CardBody>
                            <DescriptionList>
                              <DescriptionListGroup>
                                <DescriptionListDescription>
                                  {
                                    (connectorTypeDetails as ConnectorTypeAllOf)
                                      .description
                                  }
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  Version
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                  {
                                    (connectorTypeDetails as ConnectorTypeAllOf)
                                      .version
                                  }
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                              <DescriptionListGroup>
                                <DescriptionListTerm>ID</DescriptionListTerm>
                                <DescriptionListDescription>
                                  {(connectorTypeDetails as ObjectReference).id}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            </DescriptionList>
                          </CardBody>
                        </Card>
                      </Gallery>
                    </>
                  ) : (
                    <Gallery hasGutter>
                      {response?.items?.map((c) => {
                        return (
                          <Card
                            isHoverable
                            key={(c as ObjectReference).id}
                            isSelectable
                            isSelected={
                              selectedId === (c as ObjectReference).id
                            }
                            onClick={() => onSelect((c as ObjectReference).id!)}
                          >
                            <CardHeader>
                              <CardTitle>
                                {(c as ConnectorTypeAllOf).name}
                              </CardTitle>
                            </CardHeader>
                            <CardBody>
                              <DescriptionList>
                                <DescriptionListGroup>
                                  <DescriptionListDescription>
                                    {(c as ConnectorTypeAllOf).description}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>
                                    Version
                                  </DescriptionListTerm>
                                  <DescriptionListDescription>
                                    {(c as ConnectorTypeAllOf).version}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>ID</DescriptionListTerm>
                                  <DescriptionListDescription>
                                    {(c as ObjectReference).id}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                              </DescriptionList>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </Gallery>
                  )}
                </div>
              </>
            );
        }
      })()}
    </StepBodyLayout>
  );
}
type ConnectorTypesToolbarProps = {
  duplicateMode?: boolean | undefined;
};
const ConnectorTypesToolbar: FunctionComponent<ConnectorTypesToolbarProps> = ({
  duplicateMode,
}) => {
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
            isDisabled={duplicateMode}
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
            isDisabled={duplicateMode}
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>

      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={duplicateMode ? [] : categories.map((v) => stringToChip(v, t))}
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
            selections={duplicateMode ? '' : categories}
            isOpen={categoriesToggled}
            placeholderText="Connector type"
            isDisabled={duplicateMode}
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
      {!duplicateMode && (
        <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
          <ConnectorTypesPagination
            isCompact
            onChange={(page, size) =>
              onQuery({ page, size, query: request.query || {} })
            }
          />
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

type ConnectorTypesPaginationProps = {
  isCompact?: boolean;
  onChange: (page: number, size: number) => void;
};
const ConnectorTypesPagination: FunctionComponent<ConnectorTypesPaginationProps> =
  ({ isCompact = false, onChange }) => {
    const { request, response } = useConnectorTypesMachine();
    return (
      <Pagination
        itemCount={response?.total || 0}
        page={request.page}
        perPage={request.size}
        onChange={onChange}
        isCompact={isCompact}
      />
    );
  };
