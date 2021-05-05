import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  ConnectorClusterList,
  KafkaRequestList,
  ConnectorTypeList,
} from '@cos-ui/api';

export function makeHappyPath() {
  const mock = new MockAdapter(axios);
  mock
    .onGet('/dummy/api/managed-services-api/v1/kafkas')
    .reply<KafkaRequestList>(200, kafkaInstances)
    .onGet('/dummy/api/managed-services-api/v1/kafka-connector-clusters')
    .reply<ConnectorClusterList>(200, clusters)
    .onGet('/dummy/api/managed-services-api/v1/connector-types')
    .reply<ConnectorTypeList>(200, connectors);
}

export function makeKafkaError() {
  const mock = new MockAdapter(axios);
  mock.onGet('/dummy/api/managed-services-api/v1/kafkas').reply(404);
}

export function makeClusterError() {
  const mock = new MockAdapter(axios);
  mock
    .onGet('/dummy/api/managed-services-api/v1/kafkas')
    .reply<KafkaRequestList>(200, kafkaInstances)
    .onGet('/dummy/api/managed-services-api/v1/kafka-connector-clusters')
    .reply(404);
}

export function makeConnectorsError() {
  const mock = new MockAdapter(axios);
  mock
    .onGet('/dummy/api/managed-services-api/v1/kafkas')
    .reply<KafkaRequestList>(200, kafkaInstances)
    .onGet('/dummy/api/managed-services-api/v1/kafka-connector-clusters')
    .reply<ConnectorClusterList>(200, clusters)
    .onGet('/dummy/api/managed-services-api/v1/connector-types')
    .reply(404);
}

const kafkaInstances: KafkaRequestList = {
  kind: 'KafkaRequestList',
  page: 1,
  size: 6,
  total: 6,
  items: [
    {
      id: '1r9vAEfspruNoxIe4I9parl6dLo',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1r9vAEfspruNoxIe4I9parl6dLo',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'badwords',
      created_at: '2021-04-14T11:49:34.506981Z',
      updated_at: '2021-04-14T11:49:34.506981Z',
      version: '2.7.0',
    },
    {
      id: '1r9vBHHaRhzLfYHATdenlJd61cW',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1r9vBHHaRhzLfYHATdenlJd61cW',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'errors',
      created_at: '2021-04-14T11:49:42.722305Z',
      updated_at: '2021-04-14T11:49:42.722305Z',
      version: '2.7.0',
    },
    {
      id: '1r9vF0hsyZNWM3uUweCrqZf1LSE',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1r9vF0hsyZNWM3uUweCrqZf1LSE',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'go-away',
      created_at: '2021-04-14T11:50:12.585649Z',
      updated_at: '2021-04-14T11:50:12.585649Z',
      version: '2.7.0',
    },
    {
      id: '1r9vHKs7RuwisYY7g7b81FmiJ4y',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1r9vHKs7RuwisYY7g7b81FmiJ4y',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'sorrynotsorry',
      created_at: '2021-04-14T11:50:30.18851Z',
      updated_at: '2021-04-14T11:50:30.18851Z',
      version: '2.7.0',
    },
    {
      id: '1qnlZG7lCJIlxlhRgcK3OF67ypp',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1qnlZG7lCJIlxlhRgcK3OF67ypp',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'test',
      created_at: '2021-04-06T15:34:48.440246Z',
      updated_at: '2021-04-06T15:34:48.440246Z',
      version: '2.7.0',
    },
    {
      id: '1r9vIX424OhHuf7ztpAjwRLHtez',
      kind: 'Kafka',
      href: '/api/managed-services-api/v1/kafkas/1r9vIX424OhHuf7ztpAjwRLHtez',
      status: 'accepted',
      cloud_provider: 'aws',
      multi_az: true,
      region: 'us-east-1',
      owner: 'rforina',
      name: 'this-is-getting-old',
      created_at: '2021-04-14T11:50:40.272275Z',
      updated_at: '2021-04-14T11:50:40.272275Z',
      version: '2.7.0',
    },
  ],
};
const clusters: ConnectorClusterList = {
  kind: 'ConnectorClusterList',
  page: 1,
  size: 2,
  total: 2,
  items: [
    {
      id: '1r9uyAjkDfKKOr5pOnZbfdzj23D',
      kind: 'ConnectorCluster',
      href:
        '/api/managed-services-api/v1/kafka-connector-clusters/1r9uyAjkDfKKOr5pOnZbfdzj23D',
      metadata: {
        owner: 'rforina',
        name: 'megalord',
        group: 'universe',
        created_at: '2021-04-08T06:03:59.22Z',
        updated_at: '2021-04-14T11:47:58.593218Z',
      },
      status: 'unconnected',
    },
    {
      id: '1qnpZvkkZerQwjRY52v4SC82YxA',
      kind: 'ConnectorCluster',
      href:
        '/api/managed-services-api/v1/kafka-connector-clusters/1qnpZvkkZerQwjRY52v4SC82YxA',
      metadata: {
        owner: 'rforina',
        name: 'string',
        group: 'string',
        created_at: '2021-04-06T16:07:12.505Z',
        updated_at: '2021-04-06T16:07:47.154849Z',
      },
      status: 'unconnected',
    },
  ],
};
const connectors: ConnectorTypeList = {
  kind: 'ConnectorTypeList',
  page: 1,
  size: 6,
  total: 6,
  items: [
    {
      id: 'aws-kinesis-source',
      kind: 'ConnectorType',
      href: '/api/managed-services-api/v1/connector-types/aws-kinesis-source',
      name: 'aws-kinesis-source',
      version: 'v1alpha1',
      description: 'Receive data from AWS Kinesis.',
      json_schema: {
        description: 'Receive data from AWS Kinesis.',
        properties: {
          accessKey: {
            description: 'The access key obtained from AWS',
            title: 'Access Key',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          region: {
            description: 'The AWS region to connect to (capitalized name)',
            example: 'EU_WEST_1',
            title: 'AWS Region',
            type: 'string',
          },
          secretKey: {
            description: 'The secret key obtained from AWS',
            title: 'Secret Key',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          stream: {
            description:
              'The Kinesis stream that you want to access (needs to be created in advance)',
            title: 'Stream Name',
            type: 'string',
          },
        },
        required: ['stream', 'accessKey', 'secretKey', 'region'],
        title: 'AWS Kinesis Source',
      },
    },
    {
      id: 'aws-sqs-source-v1alpha1',
      kind: 'ConnectorType',
      href:
        '/api/managed-services-api/v1/connector-types/aws-sqs-source-v1alpha1',
      name: 'aws-sqs-source',
      version: 'v1alpha1',
      description: 'Receive data from AWS SQS.',
      json_schema: {
        description: 'Receive data from AWS SQS.',
        properties: {
          accessKey: {
            description: 'The access key obtained from AWS',
            title: 'Access Key',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          deleteAfterRead: {
            default: 'true',
            description: 'Delete messages after consuming them',
            title: 'Auto-delete messages',
            type: 'boolean',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:checkbox'],
          },
          queueNameOrArn: {
            description: 'The SQS Queue name or ARN',
            title: 'Queue Name',
            type: 'string',
          },
          region: {
            description: 'The AWS region to connect to',
            example: 'eu-west-1',
            title: 'AWS Region',
            type: 'string',
          },
          secretKey: {
            description: 'The secret key obtained from AWS',
            title: 'Secret Key',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
        },
        required: ['queueNameOrArn', 'accessKey', 'secretKey', 'region'],
        title: 'AWS SQS Source',
      },
    },
    {
      id: 'jira-source',
      kind: 'ConnectorType',
      href: '/api/managed-services-api/v1/connector-types/jira-source',
      name: 'jira-source',
      version: 'v1alpha1',
      description: 'Receive notifications about new issues from Jira.',
      json_schema: {
        description: 'Receive notifications about new issues from Jira.',
        properties: {
          jiraUrl: {
            description: 'The URL of your instance of Jira',
            example: 'http://my_jira.com:8081',
            title: 'Jira URL',
            type: 'string',
          },
          jql: {
            description: 'A query to filter issues',
            example: 'project=MyProject',
            title: 'JQL',
            type: 'string',
          },
          password: {
            description: 'The password to access Jira',
            title: 'Password',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          username: {
            description: 'The username to access Jira',
            title: 'Username',
            type: 'string',
          },
        },
        required: ['jiraUrl', 'username', 'password'],
        title: 'Jira Source',
      },
    },
    {
      id: 'salesforce-source',
      kind: 'ConnectorType',
      href: '/api/managed-services-api/v1/connector-types/salesforce-source',
      name: 'salesforce-source-source',
      version: 'v1alpha1',
      description: 'Receive updates from Salesforce.',
      json_schema: {
        description: 'Receive updates from Salesforce.',
        properties: {
          clientId: {
            description: 'The Salesforce application consumer key',
            title: 'Consumer Key',
            type: 'string',
          },
          clientSecret: {
            description: 'The Salesforce application consumer secret',
            title: 'Consumer Secret',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          loginUrl: {
            default: 'https://login.salesforce.com',
            description: 'The Salesforce instance login URL',
            title: 'Login URL',
            type: 'string',
          },
          password: {
            description: 'The Salesforce user password',
            title: 'Password',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
          query: {
            description: 'The query to execute on Salesforce',
            example: 'SELECT Id, Name, Email, Phone FROM Contact',
            title: 'Query',
            type: 'string',
          },
          topicName: {
            description: 'The name of the topic/channel to use',
            example: 'ContactTopic',
            title: 'Topic Name',
            type: 'string',
          },
          userName: {
            description: 'The Salesforce username',
            title: 'Username',
            type: 'string',
          },
        },
        required: [
          'query',
          'topicName',
          'clientId',
          'clientSecret',
          'userName',
          'password',
        ],
        title: 'Salesforce Source',
      },
    },
    {
      id: 'slack-source',
      kind: 'ConnectorType',
      href: '/api/managed-services-api/v1/connector-types/slack-source',
      name: 'slack-source-source',
      version: 'v1alpha1',
      description: 'Receive messages from a Slack channel.',
      json_schema: {
        description: 'Receive messages from a Slack channel.',
        properties: {
          channel: {
            description: 'The Slack channel to receive messages from',
            example: '#myroom',
            title: 'Channel',
            type: 'string',
          },
          token: {
            description:
              'The token to access Slack. A Slack app is needed. This app needs to have channels:history and channels:read permissions. The Bot User OAuth Access Token is the kind of token needed.',
            title: 'Token',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
        },
        required: ['channel', 'token'],
        title: 'Slack Source',
      },
    },
    {
      id: 'telegram-source',
      kind: 'ConnectorType',
      href: '/api/managed-services-api/v1/connector-types/telegram-source',
      name: 'telegram-source-source',
      version: 'v1alpha1',
      description:
        'Receive all messages that people send to your telegram bot.',
      json_schema: {
        description:
          'Receive all messages that people send to your telegram bot.',
        properties: {
          authorizationToken: {
            description:
              'The token to access your bot on Telegram, that you can obtain from the Telegram "Bot Father".',
            title: 'Token',
            type: 'string',
            'x-descriptors': ['urn:alm:descriptor:com.tectonic.ui:password'],
          },
        },
        required: ['authorizationToken'],
        title: 'Telegram Source',
      },
    },
  ],
};
