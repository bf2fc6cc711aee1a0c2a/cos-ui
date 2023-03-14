import { getClusters } from '@apis/api';
import {
  useNamespaceMachineIsReady,
  useNamespaceMachine,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { Loading } from '@app/components/Loading/Loading';
import { CreateNamespaceCard } from '@app/components/NamespaceCard/CreateNamespaceCard';
import { CreatePreviewNamespaceCard } from '@app/components/NamespaceCard/CreatePreviewNamespaceCard';
import { NamespaceCard } from '@app/components/NamespaceCard/NamespaceCard';
import { Pagination } from '@app/components/Pagination/Pagination';
import { RegisterEvalNamespace } from '@app/components/RegisterEvalNamespace/RegisterEvalNamespace';
import { SearchFilter } from '@app/components/SearchFilter/SearchFilter';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { PaginatedApiResponse } from '@app/machines/PaginatedResponse.machine';
import { useCos } from '@hooks/useCos';
import usePrevious from '@hooks/usePrevious';
import { getPendingTime, warningType } from '@utils/shared';
import { validateSearchField } from '@utils/shared';
import { useDebounce } from '@utils/useDebounce';
import { has, isEqual, cloneDeep } from 'lodash';
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
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Dropdown,
  DropdownToggle,
  DropdownPosition,
  DropdownItem,
  ToolbarFilter,
  Gallery,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import {
  ClockIcon,
  ExternalLinkAltIcon,
  FilterIcon,
} from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';
import {
  ConnectorClusterList,
  ConnectorNamespace,
} from '@rhoas/connector-management-sdk';

import './StepDeployment.css';

export function SelectNamespace() {
  const isReady = useNamespaceMachineIsReady();

  return isReady ? <DeploymentGallery /> : null;
}

export type ConnectorNamespaceWithCluster = {
  clusterName?: string | undefined;
} & ConnectorNamespace;

const DeploymentGallery: FunctionComponent = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [evalInstance, setEvalInstance] = useState<
    ConnectorNamespace | undefined
  >();
  const [updateResponse, setUpdateResponse] = useState<
    PaginatedApiResponse<ConnectorNamespaceWithCluster> | undefined
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

  const prevResponse = usePrevious(response);

  const getClusterName = (
    clusterList: ConnectorClusterList,
    clusterId: string
  ) => {
    return (
      clusterList.items.find((cluster) => cluster.id === clusterId)?.name || ''
    );
  };

  let getClusterInfo = useCallback(
    (data) => {
      const responseCopyItems = { ...response }.items!.map((item) => {
        return {
          ...item,
          ...(!item.expiration && {
            clusterName: getClusterName(data, item.cluster_id),
          }),
        };
      });
      setUpdateResponse({ ...response!, items: responseCopyItems });
    },
    [response]
  );

  const onClusterError = useCallback(() => {
    const responseCopyItems = { ...response }.items!.map((item) => {
      return {
        ...item,
        ...(!item.expiration && {
          clusterName: t('clusterError'),
        }),
      };
    });
    setUpdateResponse({ ...response!, items: responseCopyItems });
  }, [response, t]);

  useEffect(() => {
    if (!isEqual(prevResponse, response)) {
      setUpdateResponse(cloneDeep(response));
      getClusters({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
      })(getClusterInfo, onClusterError);
    }
  }, [
    connectorsApiBasePath,
    getClusterInfo,
    getToken,
    onClusterError,
    prevResponse,
    response,
  ]);

  useEffect(() => {
    const id = response?.items?.find(
      (namespace) =>
        namespace.tenant.kind === 'user' && has(namespace, 'expiration')
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
      title={t('deployment')}
      description={
        <Trans i18nKey={'deploymentStepDescription'}>
          Select a Connectors namespace to host your Connectors instance. Some
          namespace options are available for previewing the service with or
          without a subscription.
          <Button
            component={'a'}
            href={t('addonInstallationGuideURL')}
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            isSmall
            target={'_blank'}
            variant={ButtonVariant.link}
          >
            Learn more
          </Button>
          about your namespace options, or
          <Button
            component={'a'}
            href={t('rhocSubscriptionURL')}
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
            isSmall
            ouiaId={'description-osd-guide-link'}
            target={'_blank'}
            variant={ButtonVariant.link}
          >
            talk to a Red Hatter to get a subscription.
          </Button>
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
                <DeploymentToolbar />
                <EmptyStateNoMatchesFound
                  onClear={() => onQuery({ page: 1, size: 10 })}
                />
              </>
            );
          case noResults || error:
            return (
              <>
                <div className={'pf-l-stack__item pf-m-fill'}>
                  <Gallery hasGutter>
                    <CreateNamespaceCard className="step-deployment__card" />
                    {!evalInstance && (
                      <CreatePreviewNamespaceCard
                        className="step-deployment__card"
                        onModalToggle={onModalToggle}
                      />
                    )}
                  </Gallery>
                </div>
              </>
            );
          case loading:
            return (
              <>
                <DeploymentToolbar />
                <Loading />
              </>
            );
          default:
            return (
              <>
                <DeploymentToolbar />
                <div className={'pf-l-stack__item pf-m-fill'}>
                  {duplicateMode && namespaceExpired && (
                    <Alert
                      variant="info"
                      className="pf-u-mb-md"
                      isInline
                      title={t('duplicateAlertDeployment')}
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
                    {updateResponse &&
                      updateResponse?.items?.map((i) => (
                        <NamespaceCard
                          key={i.id}
                          isEval={!!i.expiration}
                          state={i.status.state}
                          id={i.id || ''}
                          name={i.name}
                          owner={i.owner!}
                          clusterId={i.cluster_id}
                          clusterName={i.clusterName || ''}
                          createdAt={i.created_at || ''}
                          selectedNamespace={selectedId || ''}
                          onSelect={onSelect}
                          connectorsApiBasePath={connectorsApiBasePath}
                          getToken={getToken}
                        />
                      ))}
                  </Gallery>
                  <Gallery hasGutter className="pf-u-mt-md">
                    <CreateNamespaceCard className={'step-deployment__card'} />
                    {!evalInstance && (
                      <CreatePreviewNamespaceCard
                        className={'step-deployment__card'}
                        onModalToggle={onModalToggle}
                      />
                    )}
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

const DeploymentToolbar: FunctionComponent = () => {
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

  const onChangeNameSearchField = (name?: string) => {
    debouncedOnQuery({
      size: request.size,
      page: 1,
      orderBy: request.orderBy,
      search: {
        ...request.search,
        name,
      },
    });
  };

  const onChangeClusterSearchField = (cluster_id?: string) => {
    debouncedOnQuery({
      size: request.size,
      page: 1,
      orderBy: request.orderBy,
      search: {
        ...request.search,
        cluster_id,
      },
    });
  };
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
          <SearchFilter
            placeholder={t('nameSearchPlaceholder')}
            onChangeSearchField={onChangeNameSearchField}
            SearchFieldName={'name'}
            validateFilterRegex={validateSearchField}
          />
        )}
      </ToolbarFilter>
      <ToolbarFilter
        chips={cluster_id ? [cluster_id] : []}
        deleteChip={() => onDeleteQueryGroup('cluster_id')}
        categoryName={t('clusterId')}
      >
        {selectedCategory === t('clusterId') && (
          <SearchFilter
            placeholder={t('clusteridSearchPlaceholder')}
            onChangeSearchField={onChangeClusterSearchField}
            SearchFieldName={t('clusterId')}
            validateFilterRegex={validateSearchField}
          />
        )}
      </ToolbarFilter>
    </ToolbarGroup>
  );
  const toolbarItems = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
        {toggleGroupItems}
      </ToolbarToggleGroup>
      <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
        <NamespacePagination isCompact />
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

type NamespacePaginationProps = {
  isCompact?: boolean;
};
const NamespacePagination: FunctionComponent<NamespacePaginationProps> = ({
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
  { value: 'cluster_id', label: 'Cluster id' },
];
