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

import {
  ObjectReference,
  ConnectorTypeAllOf,
} from '@rhoas/connector-management-sdk';

export type ConnectorTypeCardProps = {
  connector: ObjectReference | ConnectorTypeAllOf;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  isDuplicate?: boolean;
};

export const ConnectorTypeCard: FunctionComponent<ConnectorTypeCardProps> = ({
  connector,
  selectedId,
  onSelect,
  isDuplicate,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      isHoverable={!isDuplicate}
      key={(connector as ObjectReference).id}
      isSelectable
      isSelected={selectedId === (connector as ObjectReference).id}
      onClick={
        isDuplicate
          ? () => {}
          : () => onSelect((connector as ObjectReference).id!)
      }
    >
      {(connector as ConnectorTypeAllOf).labels?.includes('source') && (
        <CardHeader>
          <BuildIcon color="lightGrey" size="lg" />
          <CardActions>
            <Label color="blue">{t('source')}</Label>
          </CardActions>
        </CardHeader>
      )}
      {(connector as ConnectorTypeAllOf).labels?.includes('sink') && (
        <CardHeader>
          <BuilderImageIcon color="lightGrey" size="lg" />
          <CardActions>
            <Label color="green">{t('sink')}</Label>
          </CardActions>
        </CardHeader>
      )}
      <CardTitle>
        {(connector as ConnectorTypeAllOf).name}{' '}
        <Popover
          position="right"
          aria-label={t('ConnectorHelpAndGuidances')}
          headerContent={t('ConnectorHelpAndGuidances')}
          bodyContent={
            <div>{(connector as ConnectorTypeAllOf).description}</div>
          }
        >
          <OutlinedQuestionCircleIcon color="grey" />
        </Popover>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isFluid>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('version')}:</DescriptionListTerm>
            <DescriptionListDescription>
              {(connector as ConnectorTypeAllOf).version}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};
