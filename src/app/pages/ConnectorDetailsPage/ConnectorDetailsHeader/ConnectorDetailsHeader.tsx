import { deleteConnector, startConnector, stopConnector } from '@apis/api';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import { CONNECTOR_DETAILS_TABS } from '@constants/constants';
import React, { FC, useCallback, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';

import {
  PageSection,
  Breadcrumb,
  BreadcrumbItem,
  Level,
  LevelItem,
  Title,
  AlertVariant,
} from '@patternfly/react-core';

import { useAlert } from '@rhoas/app-services-ui-shared';
import {
  Connector,
  ConnectorDesiredState,
} from '@rhoas/connector-management-sdk';

import { ConnectorDetailsActionMenu } from './ConnectorDetailsActionMenu';

export type ConnectorDetailsHeaderProps = {
  connectorData: Connector;
  onDuplicateConnector: (id: string) => void;
  accessToken: () => Promise<string>;
  connectorsApiBasePath: string;
  goToConnectorList: () => void;
  editMode: boolean;
  setActiveTabKey: (key: string | number) => void;
  updateEditMode: (editMode: boolean) => void;
};

const initialState = { canStop: true, canStart: false, canDelete: true };

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'stop':
      return { ...state, canStop: false };
    case 'start':
      return { ...state, canStart: false };
    case 'delete':
      return { canStop: false, canStart: false, canDelete: false };
    default:
      return { ...state, canStart: false };
  }
}

export const ConnectorDetailsHeader: FC<ConnectorDetailsHeaderProps> = ({
  connectorData,
  onDuplicateConnector,
  accessToken,
  connectorsApiBasePath,
  goToConnectorList,
  editMode,
  setActiveTabKey,
  updateEditMode,
}) => {
  const alert = useAlert();
  const { t } = useTranslation();
  const history = useHistory();

  const [connectorState, dispatchConnectorState] = useReducer(
    reducer,
    initialState
  );

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connector-details-page-actions-alert',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );

  const startCallback = useCallback(
    (data: any) => {
      if (data.type === 'connector.actionSuccess') {
        dispatchConnectorState({ type: 'start' });
      } else {
        onError(data.error);
      }
    },
    [onError]
  );

  const stopCallback = useCallback(
    (data: any) => {
      if (data.type === 'connector.actionSuccess') {
        dispatchConnectorState({ type: 'stop' });
      } else {
        onError(data.error);
      }
    },
    [onError]
  );

  const deleteCallback = useCallback(
    (data: any) => {
      if (data.type === 'connector.actionSuccess') {
        goToConnectorList();
      } else {
        onError(data.error);
      }
    },
    [onError, goToConnectorList]
  );

  const onStart = () => {
    startConnector({
      accessToken: accessToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connector: connectorData,
    })(startCallback);
  };

  const onStop = () => {
    stopConnector({
      accessToken: accessToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connector: connectorData,
    })(stopCallback);
  };

  const onDelete = () => {
    deleteConnector({
      accessToken: accessToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connector: connectorData,
    })(deleteCallback);
  };

  const editConnector = () => {
    setActiveTabKey(CONNECTOR_DETAILS_TABS.Configuration);
    history.push(`#${CONNECTOR_DETAILS_TABS.Configuration}`);
    updateEditMode(true);
  };

  useEffect(() => {
    switch (connectorData.desired_state) {
      case ConnectorDesiredState.Stopped:
        dispatchConnectorState({ type: 'stop' });
        break;
      case ConnectorDesiredState.Ready:
        dispatchConnectorState({ type: 'start' });
        break;
      case ConnectorDesiredState.Deleted:
        dispatchConnectorState({ type: 'delete' });
        break;
      default:
        dispatchConnectorState({ type: 'start' });
    }
  }, [connectorData]);

  return (
    <PageSection variant={'light'}>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={'/'}>{t('connectorsInstances')}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{connectorData?.name}</BreadcrumbItem>
      </Breadcrumb>
      <Level className={'pf-u-pt-md pf-u-pb-md'}>
        <LevelItem>
          <Level>
            <Title headingLevel="h1" className={'pf-u-pr-md'}>
              {connectorData?.name}
            </Title>
            <ConnectorStatus
              desiredState={connectorData?.desired_state}
              name={connectorData?.name!}
              state={connectorData?.status?.state!}
            />
          </Level>
        </LevelItem>
        <LevelItem>
          <ConnectorDetailsActionMenu
            onConnectorEdit={editConnector}
            onDuplicateConnector={onDuplicateConnector}
            connector={connectorData}
            canStart={connectorState.canStart}
            canStop={connectorState.canStop}
            canDelete={connectorState.canDelete}
            isDisabled={editMode}
            onStart={onStart}
            onStop={onStop}
            onDelete={onDelete}
          />
        </LevelItem>
      </Level>
    </PageSection>
  );
};
