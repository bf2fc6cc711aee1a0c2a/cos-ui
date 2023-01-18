import React, { FC } from 'react';

import {
  Alert,
  ClipboardCopy,
  TextContent,
  Text,
} from '@patternfly/react-core';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

import { SomethingWentWrongInlineProps } from './SomethingWentWrongInline';
import './SomethingWentWrongInline.css';

export const SomethingWentWrongInlineNoSubscription: FC<
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
          <div>
            <Trans i18nKey={'somethingWentWrongInlineMessageNoSubscription'}>
              To get help, email us at
              <ClipboardCopy
                className="pf-c-clipboard-copy__text-pf-m-code"
                hoverTip={t('somethingWentWrongInlineHoverTip')}
                clickTip={t('somethingWentWrongInlineClickTip')}
                variant="inline-compact"
                isCode
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
