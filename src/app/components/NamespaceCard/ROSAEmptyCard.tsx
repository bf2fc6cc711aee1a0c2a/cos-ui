import { ADDON_INSTALLATION_GUIDE_URL } from '@constants/constants';
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

export const ROSAEmptyCard: React.FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <Card
      isSelected={false}
      isDisabledRaised={false}
      isSelectableRaised={false}
      id="rosa-empty-card"
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
          {t('createRosaNamespace')}
        </CardTitle>
      </CardTitle>
      <CardBody>{t('rosaAddOnMsg')}</CardBody>
      <CardFooter>
        <Button
          variant={ButtonVariant.link}
          isInline
          target={'_blank'}
          href={ADDON_INSTALLATION_GUIDE_URL}
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
