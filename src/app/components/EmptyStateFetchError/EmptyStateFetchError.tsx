import React, { FunctionComponent } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type EmptyStateFetchErrorProps = {
  message: string;
  onClick?: () => void;
  buttonText?: string;
};

export const EmptyStateFetchError: FunctionComponent<
  EmptyStateFetchErrorProps
> = ({ message, buttonText, onClick }) => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel={'h1'} size={TitleSizes['lg']}>
        {t('somethingWentWrong')}
      </Title>
      <EmptyStateBody>{t('fetchErrorBody', { message })}</EmptyStateBody>
      {buttonText && onClick && (
        <Button
          variant={'primary'}
          ouiaId={'button-fetch-error'}
          onClick={onClick}
        >
          {buttonText}
        </Button>
      )}
    </EmptyState>
  );
};
