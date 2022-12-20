import React from 'react';

import { Alert, Button, TextContent, Text } from '@patternfly/react-core';
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
            <Trans i18nKey={'communicationErrorMessageSubscripton'}>
              To get help,
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
        </TextContent>
      </Alert>
    </React.Fragment>
  );
};
