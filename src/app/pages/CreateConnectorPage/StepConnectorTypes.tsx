import { ConnectorTypesOrderBy, ConnectorTypesSearch } from '@apis/api';
import { ConnectorTypeCard } from '@app/components/ConnectorTypeCard/ConnectorTypeCard';
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
import { DEFAULT_CONNECTOR_TYPES_PAGE_SIZE } from '@app/machines/StepSelectConnectorType.machine';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { stringToChip } from 'src/utils/stringToChip';
import { useDebounce } from 'src/utils/useDebounce';

import {
  Alert,
  Button,
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

import { useTranslation } from '@rhoas/app-services-ui-components';
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
                        <ConnectorTypeCard
                          id={(connectorTypeDetails as ObjectReference).id!}
                          labels={
                            (connectorTypeDetails as ConnectorTypeAllOf).labels!
                          }
                          name={
                            (connectorTypeDetails as ConnectorTypeAllOf).name!
                          }
                          description={
                            (connectorTypeDetails as ConnectorTypeAllOf)
                              .description!
                          }
                          version={
                            (connectorTypeDetails as ConnectorTypeAllOf)
                              .version!
                          }
                          selectedId={selectedId}
                          onSelect={onSelect}
                          isDuplicate={duplicateMode}
                        />
                      </Gallery>
                    </>
                  ) : (
                    <Gallery hasGutter>
                      {response?.items?.map((c) => {
                        return (
                          <ConnectorTypeCard
                            key={(c as ObjectReference).id!}
                            id={(c as ObjectReference).id!}
                            labels={(c as ConnectorTypeAllOf).labels!}
                            name={(c as ConnectorTypeAllOf).name!}
                            description={(c as ConnectorTypeAllOf).description!}
                            version={(c as ConnectorTypeAllOf).version!}
                            selectedId={selectedId}
                            onSelect={onSelect}
                          />
                        );
                      })}
                    </Gallery>
                  )}
                  {!duplicateMode && (
                    <ConnectorTypesPagination onChange={runQuery} />
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
  const { request, runQuery } = useConnectorTypesMachine();
  const [categoriesToggled, setCategoriesToggled] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(runQuery, 1000);

  const { name, label = [] } = request.search || {};

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
    onSelectFilter('label', label, (value as ToolbarChip).key);
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
          chips={duplicateMode ? [] : label.map((v) => stringToChip(v, t))}
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
            selections={duplicateMode ? '' : label}
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
