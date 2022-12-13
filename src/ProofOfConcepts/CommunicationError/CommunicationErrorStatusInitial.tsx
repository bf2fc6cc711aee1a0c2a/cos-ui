import React from 'react';

import {
  Alert,
  AlertActionCloseButton,
  Button,
  ClipboardCopy,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { useTranslation } from '@rhoas/app-services-ui-components';

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
        actionClose={
          <AlertActionCloseButton
            onClose={() => alert('Clicked the close button')}
          />
        }
        actionLinks={<React.Fragment></React.Fragment>}
      >
        <p>{t('communicationErrorDescripton')}</p>
        <p>
          <br />
        </p>
        <p>
          {t('communicationErrorMessageSubscripton')}
          <Button
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="right"
            isInline
          >
            {t('communicationErrorSupportTicket')}
          </Button>
        </p>
        <p>
          <br />
        </p>
        <p>
          {t('communicationErrorMessageNoSubscripton')}
          <ClipboardCopy
            className="pf-c-clipboard-copy__text-pf-m-code"
            hoverTip="Copy"
            clickTip="Copied"
            variant="inline-compact"
            isCode
          >
            {t('communicationErrorEmail')}
          </ClipboardCopy>
        </p>
      </Alert>
    </React.Fragment>
  );
};
