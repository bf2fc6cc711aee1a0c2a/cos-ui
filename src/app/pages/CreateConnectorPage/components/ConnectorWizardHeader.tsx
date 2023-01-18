import { useCreateConnectorWizardService } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import React, { FC, useCallback } from 'react';

import { useSelector } from '@xstate/react';

import { WizardHeader } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorWizardHeader.css';

export const ConnectorWizardHeader: FC<{}> = () => {
  const { t } = useTranslation();
  const service = useCreateConnectorWizardService();
  const { connectorTypeDetails, duplicateMode } = useSelector(
    service,
    useCallback(
      (state: typeof service.state) => {
        return {
          connectorTypeDetails: state.context.connectorTypeDetails,
          duplicateMode: state.context.duplicateMode,
        };
      },
      [service]
    )
  );
  const name = connectorTypeDetails ? connectorTypeDetails.name : undefined;
  const title = duplicateMode
    ? t('duplicateConnectorsInstance')
    : t('createAConnectorsInstance');
  // pad the description with a space as we need to
  // maintain the same height for this header
  const description = name ? (
    <>
      <strong>{t('connector')}:</strong>&nbsp;
      {name}
    </>
  ) : (
    <>&nbsp;</>
  );
  return (
    <WizardHeader title={title} description={description} hideClose={true} />
  );
};
