import { ConnectorWithErrorHandler, ErrorHandler } from '@apis/api';
import { ConnectorStatus } from '@app/components/ConnectorStatus/ConnectorStatus';
import { ErrorHandlerInfo } from '@app/components/ErrorHandlerInfo/ErrorHandlerInfo';
import { ConnectorDetailsActionMenu } from '@app/pages/ConnectorDetailsPage/components/ConnectorDetailsHeader/ConnectorDetailsActionMenu';
import React, { FC, ReactElement, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  Card,
  CardActions,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  LabelGroup,
  Page,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import {
  CheckIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type ConnectorInstanceOverviewProps = {
  connectorName: string;
  desiredState: string;
  errorHandler: ErrorHandler;
  instanceId: string;
  instanceState: string;
  kafkaId: string;
  kafkaInstanceName: string;
  kafkaTopics: string[];
  kafkaClientId: string;
  kafkaClientSecret: string;
  name: string;
  notSent: number;
  sent: number;
  slackWorkspace: string;
  slackChannel: string;
  iconEmoji?: string;
  iconUrl?: string;
  owner: string;
  dateCreated: string;
  dateModified: string;
  namespaceName: string;
  namespaceTags: string[];
  clusterName: string;
  clusterId: string;
  clusterOwner: string;
  transformationDiagram: ReactElement;
};

export const ConnectorInstanceOverview: FC<ConnectorInstanceOverviewProps> = ({
  connectorName,
  desiredState,
  errorHandler,
  instanceId,
  instanceState,
  kafkaId,
  kafkaInstanceName,
  kafkaTopics,
  kafkaClientId,
  kafkaClientSecret,
  name,
  notSent,
  sent,
  slackWorkspace,
  slackChannel,
  iconEmoji,
  iconUrl,
  owner,
  dateCreated,
  dateModified,
  namespaceName,
  namespaceTags,
  clusterName,
  clusterId,
  clusterOwner,
  transformationDiagram,
}) => {
  const { t } = useTranslation();
  const [isShowSecret, setIsShowSecret] = useState<boolean>(false);
  return (
    <>
      <Page>
        <PageSection type={'breadcrumb'}>
          <Breadcrumb>
            <BreadcrumbItem>
              <Button variant={ButtonVariant.link}>
                {t('connectorsInstances')}
              </Button>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{name}</BreadcrumbItem>
          </Breadcrumb>
        </PageSection>
        <PageSection variant={'light'}>
          <Split>
            <SplitItem isFilled>
              <Stack>
                <StackItem>
                  <TextContent>
                    <Title headingLevel={'h1'}>{name}</Title>
                  </TextContent>
                </StackItem>
                <StackItem>
                  <Flex>
                    <FlexItem>
                      <TextContent>
                        <Text component={'p'}>{connectorName}</Text>
                      </TextContent>
                    </FlexItem>
                    <FlexItem>
                      <ConnectorStatus
                        desiredState={desiredState}
                        name={name}
                        state={instanceState}
                      />
                    </FlexItem>
                  </Flex>
                </StackItem>
              </Stack>
            </SplitItem>
            <SplitItem>
              <ConnectorDetailsActionMenu
                onConnectorEdit={() => {}}
                onDuplicateConnector={() => {}}
                connector={
                  { name, id: instanceId } as ConnectorWithErrorHandler
                }
                canStart={false}
                canStop={true}
                canDelete={true}
                isDisabled={false}
                onStart={() => {}}
                onStop={() => {}}
                onDelete={() => {}}
              />
            </SplitItem>
          </Split>
        </PageSection>
        <Tabs
          className={'pf-u-background-color-100'}
          usePageInsets
          activeKey={0}
          onSelect={() => {}}
        >
          <Tab
            key={0}
            eventKey={0}
            title={<TabTitleText>{t('overview')}</TabTitleText>}
          >
            <PageSection isFilled>
              <Grid hasGutter>
                <GridItem span={12}>
                  <Card id={'expandable-card'} isExpanded={true}>
                    <CardHeader
                      onExpand={() => {}}
                      toggleButtonProps={{
                        id: 'toggle-button1',
                        'aria-expanded': true,
                        'aria-label': 'Details',
                        'aria-labelledby':
                          'expandable-card-title toggle-button1',
                      }}
                    >
                      <CardTitle id={'expandable-card-title'}>
                        <Title headingLevel="h3">{t('Events processed')}</Title>
                      </CardTitle>
                    </CardHeader>
                    <CardExpandableContent>
                      <CardBody>
                        <Grid>
                          <GridItem span={8}>
                            <Grid hasGutter>
                              <GridItem span={6}>
                                <Stack hasGutter>
                                  <StackItem>
                                    <TextContent>
                                      <Text component={'h6'}>
                                        {t('Events sent')}
                                      </Text>
                                    </TextContent>
                                  </StackItem>
                                  <StackItem isFilled>
                                    <Split hasGutter>
                                      <SplitItem>
                                        <Icon status={'success'} size={'xl'}>
                                          <CheckIcon />
                                        </Icon>
                                      </SplitItem>
                                      <SplitItem>
                                        <TextContent>
                                          <Text
                                            className={'pf-u-font-size-4xl'}
                                            component={TextVariants.h1}
                                          >
                                            {sent}
                                          </Text>
                                        </TextContent>
                                      </SplitItem>
                                    </Split>
                                  </StackItem>
                                </Stack>
                              </GridItem>
                              <GridItem span={6}>
                                <Stack hasGutter>
                                  <StackItem>
                                    <TextContent>
                                      <Text component={'h6'}>
                                        {t('Events not sent')}
                                      </Text>
                                    </TextContent>
                                  </StackItem>
                                  <StackItem isFilled>
                                    <Split hasGutter>
                                      <SplitItem>
                                        <Icon status={'danger'} size={'xl'}>
                                          <ExclamationCircleIcon />
                                        </Icon>
                                      </SplitItem>
                                      <SplitItem>
                                        <TextContent>
                                          <Text
                                            className={'pf-u-font-size-4xl'}
                                            component={TextVariants.h1}
                                          >
                                            {notSent}
                                          </Text>
                                        </TextContent>
                                      </SplitItem>
                                    </Split>
                                  </StackItem>
                                </Stack>
                              </GridItem>
                              <GridItem span={12}>
                                <TextContent>
                                  <Text component={TextVariants.small}>
                                    {t(
                                      'The numbers reflect the messages processed in the last 24 hours.'
                                    )}
                                  </Text>
                                </TextContent>
                              </GridItem>
                            </Grid>
                          </GridItem>
                          <GridItem span={4}>
                            <ErrorHandlerInfo
                              errorHandler={errorHandler}
                              kafkaId={kafkaId}
                            />
                          </GridItem>
                        </Grid>
                      </CardBody>
                    </CardExpandableContent>
                  </Card>
                </GridItem>

                <GridItem span={8}>
                  <Grid hasGutter>
                    <GridItem span={6}>
                      <Card>
                        <CardHeader>
                          <CardActions>
                            <Button variant={ButtonVariant.link}>
                              {t('Edit')}
                            </Button>
                          </CardActions>
                          <CardTitle>
                            <Title headingLevel={'h3'}>{t('From')}</Title>
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Kafka instance')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {kafkaInstanceName}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Kafka topics')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {kafkaTopics.join(', ')}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Client ID')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {kafkaClientId}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Client secret')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {isShowSecret ? (
                                  <>
                                    {kafkaClientSecret}
                                    <Button
                                      className={
                                        'pf-u-py-0 pf-u-px-md pf-u-font-size-sm pf-u-color-100'
                                      }
                                      variant={ButtonVariant.plain}
                                      onClick={() => setIsShowSecret(false)}
                                    >
                                      <EyeIcon />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Text
                                      className={
                                        'pf-u-font-size-xs pf-u-display-inline'
                                      }
                                    >
                                      {'⦁'.repeat(20)}
                                    </Text>
                                    <Button
                                      className={
                                        'pf-u-py-0 pf-u-px-md pf-u-font-size-sm pf-u-color-100'
                                      }
                                      variant={ButtonVariant.plain}
                                      onClick={() => setIsShowSecret(true)}
                                    >
                                      <EyeSlashIcon />
                                    </Button>
                                  </>
                                )}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
                    </GridItem>

                    <GridItem span={6}>
                      <Card>
                        <CardHeader>
                          <CardActions>
                            <Button variant={ButtonVariant.link}>
                              {t('Edit')}
                            </Button>
                          </CardActions>
                          <CardTitle>
                            <Title headingLevel={'h3'}>{t('To')}</Title>
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Slack workspace')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {slackWorkspace}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Slack channel')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {slackChannel}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Icon emoji')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {iconEmoji || <>&nbsp;</>}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Icon URL')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {iconUrl || <>&nbsp;</>}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
                    </GridItem>

                    <GridItem span={12}>
                      <Card>
                        <CardHeader>
                          <CardActions>
                            <Button variant={ButtonVariant.link}>
                              {t('Edit')}
                            </Button>
                          </CardActions>
                          <CardTitle>
                            <Title headingLevel={'h3'}>
                              {t('Transformations and filters')}
                            </Title>
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <ToggleGroup>
                            <ToggleGroupItem key={0} text={t('YAML')} />
                            <ToggleGroupItem
                              key={1}
                              isSelected
                              text={t('Topology')}
                            />
                          </ToggleGroup>
                          {transformationDiagram}
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                </GridItem>

                <GridItem span={4}>
                  <Stack hasGutter>
                    <StackItem>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            <Title headingLevel={'h3'}>{t('Details')}</Title>
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Owner')}
                                <Button
                                  className={'pf-u-px-md pf-u-py-0'}
                                  variant={ButtonVariant.link}
                                >
                                  {t('Edit')}
                                </Button>
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {owner}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Date created')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {dateCreated}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Date modified')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {dateModified}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
                    </StackItem>

                    <StackItem>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            <Title headingLevel={'h3'}>{t('Deployment')}</Title>
                          </CardTitle>
                        </CardHeader>
                        <CardBody>
                          <DescriptionList>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Namespace')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {namespaceName}
                                <LabelGroup className={'pf-u-px-md'}>
                                  {namespaceTags.map((tag, index) => (
                                    <Label color={'purple'} key={index}>
                                      {tag}
                                    </Label>
                                  ))}{' '}
                                </LabelGroup>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Cluster Name')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {clusterName}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Cluster ID')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {clusterId}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {t('Cluster owner')}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {clusterOwner}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </CardBody>
                      </Card>
                    </StackItem>
                  </Stack>
                </GridItem>
              </Grid>
            </PageSection>
          </Tab>
          <Tab
            key={1}
            eventKey={1}
            title={<TabTitleText>{t('Flow designer')}</TabTitleText>}
          ></Tab>
        </Tabs>
      </Page>
    </>
  );
};
