import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  CardFooter,
  Flex,
  FlexItem,
  ButtonVariant,
} from '@patternfly/react-core';
import {
  ExternalLinkSquareAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

export const OSDTrailEmptyCard: React.FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <Card
      isSelected={false}
      isDisabledRaised={false}
      isSelectableRaised={false}
      id="OSD-trial-empty-card"
      hasSelectableInput={false}
    >
      <CardTitle>
        <CardHeader>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentCenter' }}
            style={{ width: '100%' }}
          >
            <FlexItem>
              <PlusCircleIcon size="xl" />
            </FlexItem>
          </Flex>
        </CardHeader>
        <CardTitle style={{ textAlign: 'center' }}>
          {t('createOSDTrail')}
        </CardTitle>
      </CardTitle>
      <CardBody>{t('osdAddOnMsg')}</CardBody>
      <CardFooter>
        <Button
          variant={ButtonVariant.link}
          isInline
          target={'_blank'}
          href={t('addonInstallationGuideURL')}
          component={'a'}
          icon={<ExternalLinkSquareAltIcon />}
          iconPosition="right"
        >
          {t('addOnLink')}
        </Button>
      </CardFooter>
    </Card>
  );
};
