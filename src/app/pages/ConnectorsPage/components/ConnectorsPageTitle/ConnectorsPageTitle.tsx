import React, { FunctionComponent } from 'react';

import {
  TextContent,
  Title,
  TextVariants,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

export const ConnectorsPageTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Title headingLevel={TextVariants.h1}>{t('connectorsInstances')}</Title>
      <Trans i18nKey={'connectorsInstancesDescription'}>
        and systems to Streams for Apache Kafka{' '}
        <Button
          variant={ButtonVariant.link}
          isSmall
          isInline
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          onClick={() => {
            window.open(
              'https://access.redhat.com/documentation/en-us/openshift_connectors/1/guide/21f5b059-044f-49d4-afca-1051e6e09c37#_b7b12de2-f59e-4d2e-b33b-afab7a7159e1',
              '_blank'
            );
          }}
          ouiaId={'link-QuickStart'}
        >
          Learn about the prerequisites.
        </Button>
      </Trans>
    </TextContent>
  );
};
