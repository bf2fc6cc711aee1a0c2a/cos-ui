import React from 'react';
import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Card,
  CardHeader,
  CardActions,
  Label,
  CardTitle,
  Popover,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import {
  BuildIcon,
  BuilderImageIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

export type ConnectorTypeCardProps = {
  id: string;
  labels: string[];
  name: string;
  description: string;
  version: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  isDuplicate?: boolean;
};

export const ConnectorTypeCard: FunctionComponent<ConnectorTypeCardProps> = ({
  id,
  labels,
  name,
  description,
  version,
  selectedId,
  onSelect,
  isDuplicate,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      isHoverable={!isDuplicate}
      key={id}
      isSelectable
      isSelected={selectedId === id}
      onClick={isDuplicate ? () => {} : () => onSelect(id)}
    >
      {labels?.includes('source') && (
        <CardHeader>
          <BuildIcon color="lightGrey" size="lg" />
          <CardActions>
            <Label color="blue">{t('source')}</Label>
          </CardActions>
        </CardHeader>
      )}
      {labels?.includes('sink') && (
        <CardHeader>
          <BuilderImageIcon color="lightGrey" size="lg" />
          <CardActions>
            <Label color="green">{t('sink')}</Label>
          </CardActions>
        </CardHeader>
      )}
      <CardTitle>
        {name}{' '}
        <Popover
          position="right"
          aria-label={t('ConnectorHelpAndGuidances')}
          headerContent={t('ConnectorHelpAndGuidances')}
          bodyContent={<div>{description}</div>}
        >
          <OutlinedQuestionCircleIcon color="grey" />
        </Popover>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isFluid>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('version')}:</DescriptionListTerm>
            <DescriptionListDescription>{version}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
