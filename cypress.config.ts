import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    env: {
      homepage: '/',
      wizard: '/create-connector',
      connectorsApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connectors?page=1&size=20&orderBy=&search=',
      connectorsActionApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connectors/',
      connectorTypesApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connector_types?page=1&size=20&orderBy=&search=',
      kafkasApiPath:
        '/localhost/api/kafkas_mgmt/v1/kafkas?page=1&size=20&search=',
      namespaceApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connector_namespaces/c9ns6husvba2r48dqnd0',
      namespacesApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connector_namespaces?page=1&size=20&search=',
      serviceAccountApiPath: '/localhost/api/kafkas_mgmt/v1/service_accounts',
      connectorCreationApiPath:
        '/localhost/api/connector_mgmt/v1/kafka_connectors?async=true',
    },
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
