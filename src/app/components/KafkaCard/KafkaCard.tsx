import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

type KafkaCardProps = {
  id: string;
  name: string;
  region: string;
  owner: string;
  createdAt: string;
  selectedKafka?: string;
  onSelect: (selectedNamespace: string) => void;
};

export const KafkaCard: React.FunctionComponent<KafkaCardProps> = ({
  id,
  name,
  region,
  owner,
  createdAt,
  selectedKafka,
  onSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      isSelected={selectedKafka === id}
      onSelectableInputChange={() => onSelect(id!)}
      isSelectableRaised
      id={`${id}-card`}
      onClick={() => onSelect(id!)}
      hasSelectableInput
    >
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardBody>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('region')}</DescriptionListTerm>
            <DescriptionListDescription>{region}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('owner')}</DescriptionListTerm>
            <DescriptionListDescription>{owner}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('created')}</DescriptionListTerm>
            <DescriptionListDescription>{createdAt}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
