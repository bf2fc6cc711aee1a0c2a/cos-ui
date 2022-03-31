import React, { VoidFunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertVariant } from '@patternfly/react-core';

export const ModalAlerts: VoidFunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <Alert
      variant={AlertVariant.info}
      isInline
      title={t('Your instance will expire after 48 hours.')}
    />
  );
};
