import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import {
  useNamespaceMachineIsReady,
  useNamespaceMachine,
} from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { EmptyStateNoMatchesFound } from '@app/components/EmptyStateNoMatchesFound/EmptyStateNoMatchesFound';
import { EmptyStateNoNamespace } from '@app/components/EmptyStateNoNamespace/EmptyStateNoNamespace';
import { Loading } from '@app/components/Loading/Loading';
import { Pagination } from '@app/components/Pagination/Pagination';
import { RegisterEvalNamespace } from '@app/components/RegisterEvalNamespace/RegisterEvalNamespace';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { useDebounce } from '@utils/useDebounce';
import { t } from 'i18next';
import _ from 'lodash';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

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
  Stack,
  StackItem,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

import { ConnectorNamespace } from '@rhoas/connector-management-sdk';

import './StepNamespace.css';

const getPendingTime = (expireTime: Date) => {
  let diff = expireTime.getTime() - new Date().getTime();
  diff = diff / 1000;
  let hourDiff = Math.floor(diff / 3600);
  diff -= hourDiff * 3600;
  let minuteDiff = Math.floor(diff / 60);
  return ` ${hourDiff} hours ${minuteDiff} minute.`;
};

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

  const {
    response,
    selectedId,
    loading,
    error,
    noResults,
    queryEmpty,
    firstRequest,
    onSelect,
    onRefresh,
    onQuery,
  } = useNamespaceMachine();
  const onModalToggle = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  const refreshResponse = () => {
    onRefresh();
  };

  const onNamespaceSelection = (namesace: ConnectorNamespace) => {
    namesace.status.state === 'ready' && onSelect(namesace.id!);
  };

  useEffect(() => {
    const id = response?.items?.find(
      (namespace) =>
        namespace.tenant.kind === 'user' && _.has(namespace, 'expiration')
    );
    id && setEvalInstance(id);
  }, [response]);

  return (
    <StepBodyLayout
      title={t('Namespace')}
      description={t('namespaceStepDescription')}
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
                  {!!evalInstance && (
                    <Alert
                      variant="info"
                      className="pf-u-mb-md"
                      isInline
                      title={
                        <span>
                          {t('evalNamespaceExpire')}
                          {getPendingTime(new Date(evalInstance.expiration!))}
                        </span>
                      }
                    />
                  )}
                  <Gallery hasGutter>
                    {response?.items?.map((i) => (
                      <Card
                        isHoverable={i.status.state === 'ready'}
                        key={i.id}
                        isSelectable={i.status.state === 'ready'}
                        isSelected={selectedId === i.id}
                        onClick={() => onNamespaceSelection(i)}
                        className={
                          i.status.state === 'deleting'
                            ? 'pf-u-background-color-disabled-color-200'
                            : ''
                        }
                      >
                        <CardHeader>
                          <Stack>
                            <StackItem>
                              {' '}
                              <CardTitle>{i.name}</CardTitle>
                            </StackItem>
                            <StackItem>
                              {i.status.state === 'disconnected' && (
                                <div className="pf-u-pt-md status">
                                  <ConnectorStatus
                                    name={''}
                                    status={i.status.state}
                                  />
                                </div>
                              )}
                              {i.status.state === 'deleting' && (
                                <div className="pf-u-pt-md">
                                  <Alert
                                    variant="danger"
                                    isInline
                                    isPlain
                                    title={t('namespaceDeleting')}
                                  />
                                </div>
                              )}
                            </StackItem>
                          </Stack>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('owner')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {i.owner}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('clusterId')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {i.cluster_id!}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('created')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {i.created_at}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
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
  // const { t } = useTranslation();
  const { request, onQuery } = useNamespaceMachine();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedOnQuery = useDebounce(onQuery, 1000);

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
                name: value,
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
          <Button
            variant="secondary"
            isDisabled={isEvalPresent}
            onClick={onModalToggle}
          >
            {t('registerEvalNamespace')}
          </Button>
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
  const { request, response, onQuery } = useNamespaceMachine();
  return (
    <Pagination
      itemCount={response?.total || 0}
      page={request.page}
      perPage={request.size}
      onChange={(page, size) => onQuery({ page, size })}
      isCompact={isCompact}
    />
  );
};
