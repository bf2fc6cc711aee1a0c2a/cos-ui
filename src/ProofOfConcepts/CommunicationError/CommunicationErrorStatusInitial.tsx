import React from 'react';

import {
  Alert,
  Button,
  ClipboardCopy,
  TextContent,
  Text,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

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
            <Trans i18nKey={'communicationErrorMessageInitialSubscripton'}>
              To get help, users with a subscription can
              <Button
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
              >
                {t('communicationErrorSupportTicket')}
              </Button>
            </Trans>
          </Text>
          <Text>
            <Trans i18nKey={'communicationErrorMessageInitialNoSubscripton'}>
              To get help without a subscription, email us at
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
