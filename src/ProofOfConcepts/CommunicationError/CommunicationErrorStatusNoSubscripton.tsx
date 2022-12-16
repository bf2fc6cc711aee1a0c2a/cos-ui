import React from 'react';

import {
  Alert,
  ClipboardCopy,
  TextContent,
  Text,
} from '@patternfly/react-core';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import './CommunicationErrorStatus.css';

export const ExpandableAlerts = () => {
  const { t } = useTranslation('cos-ui');

  return (
    <React.Fragment>
      <Alert
        isExpandable
        isInline
        variant="danger"
        title={t('communicationErrorTitle')}
      >
        <TextContent>
          <Text>{t('communicationErrorDescripton')}</Text>
          <Text>
            <Trans i18nKey={'communicationErrorMessageNoSubscripton'}>
              To get help, email us at
              <ClipboardCopy
                className="pf-c-clipboard-copy__text-pf-m-code"
                hoverTip={t('communicationErrorHoverTip')}
                clickTip={t('communicationErrorClickTip')}
                variant="inline-compact"
                isCode
              >
                {t('communicationErrorEmail')}
              </ClipboardCopy>
            </Trans>
          </Text>
        </TextContent>
      </Alert>
    </React.Fragment>
  );
};
