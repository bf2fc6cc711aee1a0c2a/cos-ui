import React, { VoidFunctionComponent } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

export const ModalAlerts: VoidFunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <Alert
      variant={AlertVariant.info}
      isInline
      title={t('namespaceExpireAlert')}
    />
  );
};
