import {
  useNamespaceMachineIsReady,
  useNamespaceMachine,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { EmptyStateNoNamespace } from '@app/components/EmptyStateNoNamespace/EmptyStateNoNamespace';
import { Loading } from '@app/components/Loading/Loading';
import { NamespaceCard } from '@app/components/NamespaceCard/NamespaceCard';
import { Pagination } from '@app/components/Pagination/Pagination';
import { RegisterEvalNamespace } from '@app/components/RegisterEvalNamespace/RegisterEvalNamespace';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { useCos } from '@hooks/useCos';
import { getPendingTime, warningType } from '@utils/shared';
import { useDebounce } from '@utils/useDebounce';
import _ from 'lodash';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
  SyntheticEvent,
} from 'react';

import {
  Alert,
  Button,
  ButtonVariant,
  Gallery,
  InputGroup,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
  Dropdown,
  DropdownToggle,
  DropdownPosition,
  DropdownItem,
  ToolbarFilter,
} from '@patternfly/react-core';
import { ClockIcon, FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import './StepNamespace.css';

export function SelectNamespace() {
  const isReady = useNamespaceMachineIsReady();

  return isReady ? <ClustersGallery /> : null;
}

const ClustersGallery: FunctionComponent = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [evalInstance, setEvalInstance] = useState<
    ConnectorNamespace | undefined
  >();
  const [namespaceExpired, setNamespaceExpired] = useState<boolean>(false);

  const {
    response,
    selectedId,
    duplicateMode,
    loading,
    error,
    noResults,
    queryEmpty,
    firstRequest,
    onSelect,
    onDeselect,
    onRefresh,
    runQuery: onQuery,
  } = useNamespaceMachine();
  const onModalToggle = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  const refreshResponse = () => {
    onRefresh();
  };

  const { connectorsApiBasePath, getToken } = useCos();

  const getEvalNamespaceAlert = (expiration: string): string => {
    const { hours, min } = getPendingTime(new Date(expiration));
    if (hours < 0 || min < 0) {
      return t('evalNamespaceExpiredMsg');
    }
    return t('evalNamespaceExpire', { hours, min });
  };

  useEffect(() => {
    const id = response?.items?.find(
      (namespace) =>
        namespace.tenant.kind === 'user' && _.has(namespace, 'expiration')
    );
    id ? setEvalInstance(id) : setEvalInstance(undefined);
  }, [response]);

  useEffect(() => {
    if (duplicateMode && response) {
      if (response?.items?.find((i) => i.id === selectedId)) {
        onSelect(selectedId!);
      } else {
        setNamespaceExpired(true);
        onDeselect();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateMode, response, onDeselect]);

  return (
    <StepBodyLayout
      title={t('namespace')}
      description={
        <Trans i18nKey={'namespaceStepDescription'}>
          The selected namespace hosts your Connectors instance. Use a namespace
          in an OpenShift Dedicated trial cluster, or have Red Hat create a
          preview namespace for you. For instructions on adding a namespace to a
          trial cluster, access the{' '}
          <Button
            variant={ButtonVariant.link}
            isSmall
            isInline
            component={'a'}
            href={t('osdInstallationGuideLink')}
            target={'_blank'}
            ouiaId={'description-osd-guide-link'}
          >
            guide
          </Button>
          .
        </Trans>
      }
    >
      {(() => {
        switch (true) {
          case firstRequest:
            return <Loading />;
          case queryEmpty:
            return (
              <>
                <ClustersToolbar
                  onModalToggle={onModalToggle}
                  isEvalPresent={!!evalInstance}
                />
                <EmptyStateNoMatchesFound
                  onClear={() => onQuery({ page: 1, size: 10 })}
                />
              </>
            );
          case noResults || error:
            return (
              <>
                <ClustersToolbar
                  onModalToggle={onModalToggle}
                  isEvalPresent={!!evalInstance}
                />
                <EmptyStateNoNamespace onModalToggle={onModalToggle} />
              </>
            );
          case loading:
            return (
              <>
                <ClustersToolbar
                  onModalToggle={onModalToggle}
                  isEvalPresent={!!evalInstance}
                />
                <Loading />
              </>
            );
          default:
            return (
              <>
                <ClustersToolbar
                  onModalToggle={onModalToggle}
                  isEvalPresent={!!evalInstance}
                />
                <div className={'pf-l-stack__item pf-m-fill'}>
                  {duplicateMode && namespaceExpired && (
                    <Alert
                      variant="info"
                      className="pf-u-mb-md"
                      isInline
                      title={t('duplicateAlertNamespace')}
                    />
                  )}

                  {!!evalInstance && evalInstance?.id === selectedId && (
                    <Alert
                      customIcon={<ClockIcon />}
                      variant={warningType(new Date(evalInstance.expiration!))}
                      className="pf-u-mb-md"
                      isInline
                      title={
                        <span>
                          {getEvalNamespaceAlert(evalInstance.expiration!)}
                        </span>
                      }
                    />
                  )}
                  <Gallery hasGutter>
                    {response?.items?.map((i) => (
                      <NamespaceCard
                        key={i.id}
                        state={i.status.state}
                        id={i.id || ''}
                        name={i.name}
                        clusterId={i.cluster_id}
                        createdAt={i.created_at || ''}
                        selectedNamespace={selectedId || ''}
                        onSelect={onSelect}
                        connectorsApiBasePath={connectorsApiBasePath}
                        getToken={getToken}
                      />
                    ))}
                  </Gallery>
                </div>
              </>
            );
        }
      })()}
      <RegisterEvalNamespace
        isModalOpen={isModalOpen}
        onModalToggle={onModalToggle}
        refreshResponse={refreshResponse}
      />
    </StepBodyLayout>
  );
};

type ClustersToolbarProps = {
  onModalToggle: () => void;
  isEvalPresent: boolean;
};
const ClustersToolbar: FunctionComponent<ClustersToolbarProps> = ({
  onModalToggle,
  isEvalPresent,
}) => {
  const { t } = useTranslation();
  const { request, runQuery } = useNamespaceMachine();

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const clusterIdInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(runQuery, 1000);
  const [categoryToggled, setCategoryToggled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Name');

  const { name, cluster_id } = request.search || {};

  const clearAllFilters = useCallback(
    () => runQuery({ page: 1, size: request.size }),
    [runQuery, request.size]
  );

  const onDeleteQueryGroup = (category: string) =>
    runQuery({
      ...request,
      search: {
        ...(request.search || {}),
        [category]: undefined,
      },
    });

  const filterCategoryMenuItems = filterCategoryOptions.map(
    ({ value, label }) => <DropdownItem key={value}>{label}</DropdownItem>
  );

  const onFilterCategoryToggle = useCallback(
    () => setCategoryToggled((prev) => !prev),
    []
  );

  const selectCategory = useCallback(
    (event?: SyntheticEvent<HTMLDivElement, Event> | undefined) => {
      const eventTarget = event?.target as HTMLElement;
      const selectedCategory = eventTarget.innerText;
      setSelectedCategory(selectedCategory);
      setCategoryToggled((prev) => !prev);
    },
    []
  );

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = name || '';
    }
    if (clusterIdInputRef.current) {
      clusterIdInputRef.current.value = cluster_id || '';
    }
  }, [nameInputRef, clusterIdInputRef, name, cluster_id]);

  const filterCategoryDropdown = (
    <ToolbarItem>
      <Dropdown
        onSelect={(event) => selectCategory(event)}
        position={DropdownPosition.left}
        toggle={
          <DropdownToggle
            onToggle={onFilterCategoryToggle}
            style={{ width: '100%' }}
          >
            <FilterIcon size="sm" /> {selectedCategory}
          </DropdownToggle>
        }
        isOpen={categoryToggled}
        dropdownItems={filterCategoryMenuItems}
        style={{ width: '100%' }}
      ></Dropdown>
    </ToolbarItem>
  );

  const toggleGroupItems = (
    <ToolbarGroup variant="filter-group">
      {filterCategoryDropdown}
      <ToolbarFilter
        chips={name ? [name] : []}
        deleteChip={() => onDeleteQueryGroup('name')}
        categoryName={t('name')}
      >
        {selectedCategory === t('name') && (
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name={t('name')}
                id={t('name')}
                type="search"
                placeholder={t('nameSearchPlaceholder')}
                aria-label={t('nameSearchPlaceholder')}
                onChange={(name) =>
                  debouncedOnQuery({
                    size: request.size,
                    page: 1,
                    orderBy: request.orderBy,
                    search: {
                      ...request.search,
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
        )}
      </ToolbarFilter>
      <ToolbarFilter
        chips={cluster_id ? [cluster_id] : []}
        deleteChip={() => onDeleteQueryGroup('cluster_id')}
        categoryName={t('clusterId')}
      >
        {selectedCategory === t('clusterId') && (
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name={t('clusterId')}
                id={t('clusterId')}
                type="search"
                placeholder={t('clusteridSearchPlaceholder')}
                aria-label={t('clusteridSearchPlaceholder')}
                onChange={(cluster_id) =>
                  debouncedOnQuery({
                    size: request.size,
                    page: 1,
                    orderBy: request.orderBy,
                    search: {
                      ...request.search,
                      cluster_id,
                    },
                  })
                }
                ref={clusterIdInputRef}
              />
              <Button
                variant={'control'}
                aria-label="search button for search input"
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        )}
      </ToolbarFilter>
    </ToolbarGroup>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarGroup variant="icon-button-group">
        <ToolbarItem>
          <Tooltip
            content={
              <div>
                {isEvalPresent
                  ? t('namespaceDisabledTooltip')
                  : t('namespaceEnabledTooltip')}
              </div>
            }
          >
            <Button
              variant="secondary"
              isDisabled={isEvalPresent}
              onClick={onModalToggle}
              ouiaId={'button-create'}
            >
              {t('createPreviewNamespace')}
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <ClustersPagination isCompact />
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

type ClustersPaginationProps = {
  isCompact?: boolean;
};
const ClustersPagination: FunctionComponent<ClustersPaginationProps> = ({
  isCompact = false,
}) => {
  const { request, response, runQuery } = useNamespaceMachine();
  return (
    <Pagination
      itemCount={response?.total || 0}
      page={request.page}
      perPage={request.size}
      onChange={(event) =>
        runQuery({ ...event, orderBy: request.orderBy, search: request.search })
      }
      isCompact={isCompact}
    />
  );
};
type KeyValueOptions = {
  value: string;
  label: string;
};

const filterCategoryOptions: KeyValueOptions[] = [
  { value: 'name', label: 'Name' },
  { value: 'cluster_id', label: 'Cluster Id' },
];
