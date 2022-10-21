import React, { FunctionComponent } from 'react';

import { TextContent, Title, TextVariants } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

export const ConnectorsPageTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Title headingLevel={TextVariants.h1}>{t('connectorsInstances')}</Title>
    </TextContent>
  );
};
