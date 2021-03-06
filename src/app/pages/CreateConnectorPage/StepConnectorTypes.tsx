import { ConnectorTypesOrderBy, ConnectorTypesSearch } from '@apis/api';
import {
  useConnectorTypesMachine,
  useConnectorTypesMachineIsReady,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateGenericError } from '@app/components/EmptyStateGenericError/EmptyStateGenericError';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import {
  Pagination,
  PaginationEvent,
} from '@app/components/Pagination/Pagination';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { DEFAULT_CONNECTOR_TYPES_PAGE_SIZE } from '@app/machines/StepConnectorTypes.machine';
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
  CardActions,
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
  Label,
  Popover,
} from '@patternfly/react-core';
import {
  FilterIcon,
  BuildIcon,
  BuilderImageIcon,
  SearchIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

import {
  ConnectorTypeAllOf,
  ObjectReference,
} from '@rhoas/connector-management-sdk';

import './StepConnectorTypes.css';

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
    runQuery,
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
                  onClear={() =>
                    runQuery({
                      page: 1,
                      size: DEFAULT_CONNECTOR_TYPES_PAGE_SIZE,
                      search: undefined,
                    })
                  }
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
                        title={t('duplicateAlertConnectorType')}
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
                          {(
                            connectorTypeDetails as ConnectorTypeAllOf
                          ).labels?.includes('source') && (
                            <CardHeader>
                              <BuildIcon color="lightGrey" size="lg" />
                              <CardActions>
                                <Label color="blue">{t('source')}</Label>
                              </CardActions>
                            </CardHeader>
                          )}
                          {(
                            connectorTypeDetails as ConnectorTypeAllOf
                          ).labels?.includes('sink') && (
                            <CardHeader>
                              <BuilderImageIcon color="lightGrey" size="lg" />
                              <CardActions>
                                <Label color="green">{t('sink')}</Label>
                              </CardActions>
                            </CardHeader>
                          )}
                          <CardTitle>
                            {(connectorTypeDetails as ConnectorTypeAllOf).name}{' '}
                            <Popover
                              position="right"
                              aria-label={t('ConnectorHelpAndGuidances')}
                              headerContent={t('ConnectorHelpAndGuidances')}
                              bodyContent={
                                <div>
                                  {
                                    (connectorTypeDetails as ConnectorTypeAllOf)
                                      .description
                                  }
                                </div>
                              }
                            >
                              <OutlinedQuestionCircleIcon color="grey" />
                            </Popover>
                          </CardTitle>
                          <CardBody>
                            <DescriptionList isHorizontal isFluid>
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  {t('version')}:
                                </DescriptionListTerm>
                                <DescriptionListDescription>
                                  {
                                    (connectorTypeDetails as ConnectorTypeAllOf)
                                      .version
                                  }
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
                            {(c as ConnectorTypeAllOf).labels?.includes(
                              'source'
                            ) && (
                              <CardHeader>
                                <BuildIcon color="lightGrey" size="lg" />
                                <CardActions>
                                  <Label color="blue">{t('source')}</Label>
                                </CardActions>
                              </CardHeader>
                            )}
                            {(c as ConnectorTypeAllOf).labels?.includes(
                              'sink'
                            ) && (
                              <CardHeader>
                                <BuilderImageIcon color="lightGrey" size="lg" />
                                <CardActions>
                                  <Label color="green">{t('sink')}</Label>
                                </CardActions>
                              </CardHeader>
                            )}
                            <CardTitle>
                              {(c as ConnectorTypeAllOf).name}{' '}
                              <Popover
                                position="right"
                                aria-label={t('ConnectorHelpAndGuidances')}
                                headerContent={t('ConnectorHelpAndGuidances')}
                                bodyContent={
                                  <div>
                                    {(c as ConnectorTypeAllOf).description}
                                  </div>
                                }
                              >
                                <OutlinedQuestionCircleIcon color="grey" />
                              </Popover>
                            </CardTitle>
                            <CardBody>
                              <DescriptionList isHorizontal isFluid>
                                <DescriptionListGroup>
                                  <DescriptionListTerm>
                                    {t('version')}:
                                  </DescriptionListTerm>
                                  <DescriptionListDescription>
                                    {(c as ConnectorTypeAllOf).version}
                                  </DescriptionListDescription>
                                </DescriptionListGroup>
                              </DescriptionList>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </Gallery>
                  )}
                  <ConnectorTypesPagination onChange={runQuery} />
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
  const { request, runQuery } = useConnectorTypesMachine();
  const [categoriesToggled, setCategoriesToggled] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(runQuery, 1000);

  const { name, categories = [] } = request.search || {};

  const clearAllFilters = useCallback(
    () => runQuery({ page: 1, size: request.size, search: undefined }),
    [runQuery, request.size]
  );

  const toggleCategories = useCallback(
    () => setCategoriesToggled((prev) => !prev),
    []
  );

  const onSelectFilter = (category: string, values: string[], value: string) =>
    runQuery({
      ...request,
      search: {
        ...(request.search || {}),
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
    runQuery({
      ...request,
      search: {
        ...(request.search || {}),
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
    <SelectOption
      key="sink"
      value="sink"
      description={t('shortDescriptionSink')}
    >
      {t('sink')}
    </SelectOption>,
    <SelectOption
      key="source"
      value="source"
      description={t('shortDescriptionSource')}
    >
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
                search: {
                  ...request.search,
                  name,
                },
              })
            }
            ouiaId={'search-field'}
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
            onChange={(event) =>
              runQuery({ ...event, search: request.search || {} })
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
  onChange: (
    event: PaginationEvent<ConnectorTypesOrderBy, ConnectorTypesSearch>
  ) => void;
};
const ConnectorTypesPagination: FunctionComponent<ConnectorTypesPaginationProps> =
  ({ isCompact = false, onChange }) => {
    const { request, response } = useConnectorTypesMachine();
    return (
      <Pagination
        itemCount={response?.total || 0}
        page={request.page}
        perPage={request.size}
        onChange={(event) => {
          onChange({
            ...event,
            orderBy: request.orderBy,
            search: request.search,
          });
        }}
        isCompact={isCompact}
      />
    );
  };
