import React, { FC } from 'react';

import {
  Alert,
  Button,
  ClipboardCopy,
  TextContent,
  Text,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import './SomethingWentWrongInline.css';

export type SomethingWentWrongInlineProps = {
  errorMessage: string;
};

export const SomethingWentWrongInline: FC<SomethingWentWrongInlineProps> = ({
  errorMessage,
}) => {
  const { t } = useTranslation('cos-ui');
  return (
    <React.Fragment>
      <Alert
        isExpandable
        isInline
        variant="danger"
        title={t('somethingWentWrongInlineTitle')}
      >
        <TextContent>
          <Text>
            {t('somethingWentWrongInlineDescription', { errorMessage })}
          </Text>
          <Text>
            <Trans
              i18nKey={'somethingWentWrongInlineMessageInitialSubscription'}
            >
              To get help, users with a subscription can{' '}
              <Button
                component={'a'}
                variant={ButtonVariant.link}
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={t('supportURL')}
                target={'_blank'}
              >
                open a support ticket
                {t('somethingWentWrongInlineSupportTicket')}
              </Button>
            </Trans>
          </Text>
          <div>
            <Trans
              i18nKey={'somethingWentWrongInlineMessageInitialNoSubscription'}
            >
              To get help without a subscription, email us at
              <ClipboardCopy
                className="pf-c-clipboard-copy__text-pf-m-code"
                hoverTip={t('somethingWentWrongInlineHoverTip')}
                clickTip={t('somethingWentWrongInlineClickTip')}
                variant="inline-compact"
              >
                {t('somethingWentWrongInlineEmail')}
              </ClipboardCopy>
            </Trans>
          </div>
        </TextContent>
      </Alert>
    </React.Fragment>
  );
};
