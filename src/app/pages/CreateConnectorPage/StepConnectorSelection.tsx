import {
  ConnectorSelectionList,
  ConnectorSelectionListInnerProps,
} from '@app/components/ConnectorSelectionList/ConnectorSelectionList';
import { ConnectorTypeCard } from '@app/components/ConnectorTypeCard/ConnectorTypeCard';
import { useConnectorTypesMachine } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import React, { FC } from 'react';

import { Alert, Gallery } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

export function StepConnectorSelection() {
  const { t } = useTranslation();
  const { duplicateMode } = useConnectorTypesMachine();
  return (
    <StepBodyLayout title={t('Connector')}>
      {duplicateMode ? DuplicateModeView() : SelectionModeView()}
    </StepBodyLayout>
  );
}

const DuplicateModeView = () => {
  const { t } = useTranslation();
  const { selectedId, connectorTypeDetails } = useConnectorTypesMachine();
  return (
    <>
      <Alert
        variant="info"
        className="pf-u-mb-md"
        isInline
        title={t('duplicateAlertConnectorType')}
      />
      <Gallery hasGutter>
        <ConnectorTypeCard
          id={connectorTypeDetails.id!}
          labels={connectorTypeDetails.labels!}
          name={connectorTypeDetails.name!}
          description={connectorTypeDetails.description!}
          version={connectorTypeDetails.version!}
          selectedId={selectedId}
          onSelect={() => {}}
          isDuplicate={true}
        />
      </Gallery>
    </>
  );
};

const SelectionModeView = () => (
  <ConnectorSelectionList
    renderSelector={(renderSelectionList) => (
      <SelectionModeViewInner renderSelectionList={renderSelectionList} />
    )}
  />
);

const SelectionModeViewInner: FC<ConnectorSelectionListInnerProps> = ({
  renderSelectionList,
}) => {
  const { selectedId, onSelect } = useConnectorTypesMachine();
  return renderSelectionList({ selectedId, onSelect });
};
