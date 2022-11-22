import React from 'react';

import {
  Card,
  CardHeader,
  Stack,
  StackItem,
  CardTitle,
  Alert,
  Spinner,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { ConnectorNamespaceState } from '@rhoas/connector-management-sdk';

type EvalNamespaceCardProps = {
  state: string;
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  selectedNamespace: string;
  onSelect: (selectedNamespace: string) => void;
};

export const EvalNamespaceCard: React.FunctionComponent<EvalNamespaceCardProps> =
  ({ state, id, name, owner, createdAt, selectedNamespace, onSelect }) => {
    const { t } = useTranslation();

    const onNamespaceSelection = () => {
      state === ConnectorNamespaceState.Ready && onSelect(id);
    };

    return (
      <Card
            // isHoverable={state === ConnectorNamespaceState.Ready}
        // isSelectable={state === ConnectorNamespaceState.Ready}
        isSelected={selectedNamespace === id}
        // onClick={onNamespaceSelection}
        isDisabledRaised={state !== ConnectorNamespaceState.Ready}

        onSelectableInputChange={onNamespaceSelection}
        isSelectableRaised


        id={`${id}-card`}
        // onKeyDown={onKeyDown}
        onClick={onNamespaceSelection}
        hasSelectableInput
        // onSelectableInputChange={onChange}
        // isSelectableRaised
        // isSelected={selected === 'selectable-second-card'}
      >
        <CardHeader>
          <Stack>
            <StackItem>
              {' '}
              <CardTitle>{name}</CardTitle>
            </StackItem>
            <StackItem>
              {state === ConnectorNamespaceState.Disconnected && (
                <div className="pf-u-pt-md status">
                  <Alert
                    variant="info"
                    customIcon={
                      <Spinner
                        size="md"
                        aria-label={t('provisioning')}
                        aria-valuetext="Please wait..."
                      />
                    }
                    isInline
                    isPlain
                    title={t('provisioning')}
                  />
                </div>
              )}
              {(state === ConnectorNamespaceState.Deleting ||
                state === ConnectorNamespaceState.Deleted) && (
                <div className="pf-u-pt-md">
                  <Alert
                    variant="danger"
                    isInline
                    isPlain
                    title={
                      state === ConnectorNamespaceState.Deleting
                        ? t('namespaceDeleting')
                        : t('deleted')
                    }
                  />
                </div>
              )}
            </StackItem>
          </Stack>
        </CardHeader>
        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('owner')}</DescriptionListTerm>
              <DescriptionListDescription>{owner}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('created')}</DescriptionListTerm>
              <DescriptionListDescription>
                <time
                  title={t('{{date}}', {
                    date: new Date(createdAt),
                  })}
                  dateTime={new Date(createdAt)?.toISOString()}
                >
                  {t('{{ date, ago }}', {
                    date: new Date(createdAt),
                  })}
                </time>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };
