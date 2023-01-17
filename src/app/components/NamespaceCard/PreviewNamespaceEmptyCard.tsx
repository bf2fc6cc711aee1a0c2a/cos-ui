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
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

type PreviewNamespaceEmptyCardProps = {
  onModalToggle: () => void;
};

export const PreviewNamespaceEmptyCard: React.FunctionComponent<
  PreviewNamespaceEmptyCardProps
> = ({ onModalToggle }) => {
  const { t } = useTranslation();
  return (
    <Card>
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
          {t('createPreviewNamespace')}
        </CardTitle>
      </CardTitle>
      <CardBody style={{ textAlign: 'center' }}>
        {t('previewNamespaceMsg')}
      </CardBody>
      <CardFooter>
        <Button
          variant="link"
          isInline
          style={{ textAlign: 'center' }}
          onClick={onModalToggle}
        >
          {t('createPreviewNamespace')}
        </Button>
      </CardFooter>
    </Card>
  );
};
