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

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(runQuery, 1000);

  // const [statuses, setStatuses] = useState<string[]>([
  //   'Pending',
  //   'Created',
  //   'Cancelled',
  // ]);
  // const [statusesToggled, setStatusesToggled] = useState(false);
  // const clearAllFilters = useCallback(() => {
  //   setSearchValue('');
  //   setStatuses([]);
  // }, []);
  // const toggleStatuses = useCallback(
  //   () => setStatusesToggled(prev => !prev),
  //   []
  // );
  // const onSelectStatus = useCallback(
  //   (_, status) =>
  //     setStatuses(prev =>
  //       prev.includes(status)
  //         ? prev.filter(s => s !== status)
  //         : [...prev, status]
  //     ),
  //   []
  // );

  // const statusMenuItems = [
  //   <SelectOption key="statusPending" value="Pending" />,
  //   <SelectOption key="statusCreated" value="Created" />,
  //   <SelectOption key="statusCancelled" value="Cancelled" />,
  // ];

  // ensure the search input value reflects what's specified in the request object
  // useEffect(() => {
  //   if (searchInputRef.current) {
  //     searchInputRef.current.value = (request.name as string | undefined) || '';
  //   }
  // }, [searchInputRef, request]);

  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <InputGroup>
          <TextInput
            name="textInput2"
            id="textInput2"
            type="search"
            aria-label="search input example"
            onChange={(value) =>
              debouncedOnQuery({
                size: request.size,
                page: 1,
                search: {
                  name: value,
                },
              })
            }
            ref={searchInputRef}
          />
          <Button
            variant={'control'}
            aria-label="search button for search input"
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
      {/* <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={statuses}
          deleteChip={onSelectStatus}
          deleteChipGroup={() => setStatuses([])}
          categoryName="Status"
        >
          <Select
            variant={'checkbox'}
            aria-label="Status"
            onToggle={toggleStatuses}
            onSelect={onSelectStatus}
            selections={statuses}
            isOpen={statusesToggled}
            placeholderText="Status"
          >
            {statusMenuItems}
          </Select>
        </ToolbarFilter>
      </ToolbarGroup> */}
    </>
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
      // clearAllFilters={clearAllFilters}
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
