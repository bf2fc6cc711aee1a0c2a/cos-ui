import React, { FC } from 'react';

import { Alert, Button, TextContent, Text } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import { SomethingWentWrongInlineProps } from './SomethingWentWrongInline';
import './SomethingWentWrongInline.css';

export const SomethingWentWrongInlineSubscription: FC<
  SomethingWentWrongInlineProps
> = ({ errorMessage }) => {
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
            <Trans i18nKey={'somethingWentWrongInlineMessageSubscription'}>
              To get help,{' '}
              <Button
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
              >
                {t('somethingWentWrongInlineSupportTicket')}
              </Button>
            </Trans>
          </Text>
        </TextContent>
      </Alert>
    </React.Fragment>
  );
};
