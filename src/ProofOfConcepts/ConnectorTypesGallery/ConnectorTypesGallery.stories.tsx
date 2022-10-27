import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rest } from 'msw';
import Prando from 'prando';
import React from 'react';

import { CosContextProvider } from '../../hooks/useCos';
import { ConnectorTypesGalleryWrapper } from './ConnectorTypesGalleryWrapper';
import { FeaturedConnectorType } from './typeExtensions';

const API_HOST = 'https://dummy.server';

export default {
  title: 'Proof Of Concepts/ConnectorTypesGallery',
  component: ConnectorTypesGalleryWrapper,
  decorators: [
    (Story) => (
      <>
        <CosContextProvider
          getToken={() => Promise.resolve('')}
          connectorsApiBasePath={API_HOST}
          kafkaManagementApiBasePath={API_HOST}
        >
          <Story />
        </CosContextProvider>
      </>
    ),
  ],
  args: {},
} as ComponentMeta<typeof ConnectorTypesGalleryWrapper>;

const Template: ComponentStory<typeof ConnectorTypesGalleryWrapper> = (
  args
) => <ConnectorTypesGalleryWrapper {...args} />;

const categories = [
  'AI/Machine learning',
  'Serverless',
  'Big Data',
  'Database',
  'Change data capture',
  'Developer tools',
  'Integration & delivery',
  'Logging',
  'Monitoring',
  'CRM',
  'Storage',
  'Streaming & messaging',
  'Amazon',
  'Google',
  'Azure',
];

const CONNECTOR_COUNT = 235;
const FEATURED_COUNT = 5;
const CONNECTOR_TYPES_API = `${API_HOST}/api/connector_mgmt/v1/kafka_connector_types`;
const CONNECTOR_LABELS_API = `${API_HOST}/api/connector_mgmt/v1/kafka_connector_types/labels`;

export const WithConnectorTypes = Template.bind({});
WithConnectorTypes.args = {};
WithConnectorTypes.parameters = {
  msw: [
    rest.get(`${CONNECTOR_LABELS_API}*`, (req, res, ctx) => {
      const { search, orderBy } = getPaginationCriteria(req.url.searchParams);
      const response = generateConnectorTypeLabelsResponse(
        search,
        orderBy,
        CONNECTOR_COUNT
      );
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(`${CONNECTOR_TYPES_API}*`, (req, res, ctx) => {
      const { page, size, search, orderBy } = getPaginationCriteria(
        req.url.searchParams
      );
      const response = generateConnectorTypesResponse(
        page,
        size,
        search,
        orderBy,
        CONNECTOR_COUNT
      );
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

function generateConnectorTypesResponse(page, size, search, orderBy, total) {
  const start = (page - 1) * size;
  const end = start + size;
  const fullSet = generateConnectorTypes(total, search, orderBy);
  const items = fullSet.slice(start, end);
  return {
    page,
    size,
    items,
    total: fullSet.length,
  };
}

function generateConnectorTypeLabelsResponse(search, orderBy, total) {
  const fullSet = generateConnectorTypes(total, search, orderBy);
  const items = getCategoryLabels(fullSet);
  return { items };
}

function getPaginationCriteria(searchParams: URLSearchParams) {
  const page = +(searchParams.get('page') || 1);
  const size = +(searchParams.get('size') || 20);
  const search = searchParams.get('search') || '';
  const orderBy = searchParams.get('orderBy') || '';
  return { page, size, search, orderBy };
}

// generate a deterministic set of connector types
function generateConnectorTypes(
  total: number,
  search: string,
  orderBy: string
) {
  const rng = new Prando('story-connector-types');
  const sortFunctions = createSortFunctions(orderBy);
  const filterFunctions = createFilterFunctions(search);

  function determineLabels() {
    const numLabels = rng.nextInt(1, 3);
    const answer = Array.from(
      { length: numLabels },
      () => categories[rng.nextInt(0, categories.length - 1)]
    );
    return answer.filter((val, index, self) => self.indexOf(val) === index);
  }

  const fullSet = Array.from(
    {
      length: total,
    },
    (_, index) => {
      const labels = determineLabels();
      const version = `${labels[rng.nextInt(0, labels.length - 1)]
        .split(' ')
        .join('-')
        .replace('/', '_')
        .replace('&', '_')}_0.${index}${
        rng.nextBoolean() ? '' : ' alpha'
      }`.toLocaleLowerCase();
      const type = rng.nextBoolean() ? 'source' : 'sink';
      const name = `${labels.join(' ')} ${
        type === 'source' ? 'Source' : 'Sink'
      }`;
      return {
        name,
        id: `${name.split(' ').join('-').toLocaleLowerCase()}-${index}`,
        version,
        description:
          type === 'source'
            ? `Receives data from ${name} and is connector type ${index}`
            : `Sends data to ${name} and is connector type ${index}`,
        labels: [...labels, type],
        featured_rank: 0,
      };
    }
  );
  for (let i = 0; i < FEATURED_COUNT; i++) {
    fullSet[rng.nextInt(0, fullSet.length - 1)].featured_rank = rng.nextInt(
      1,
      10
    );
  }
  sortFunctions.forEach((func) => fullSet.sort(func));
  return fullSet.filter((connectorType) =>
    filterFunctions.every((func) => func(connectorType))
  );
}

function getCategoryLabels(fullSet: Array<FeaturedConnectorType>) {
  const labelDictionary = categories
    .map((category) => ({ label: category, count: 0 }))
    .reduce(
      (prev, current, index, array) => ({
        [current.label]: {
          ...current,
        },
        ...prev,
      }),
      {}
    );
  fullSet.forEach((connectorType) => {
    connectorType.labels!.forEach((label) => {
      if (label === 'source' || label === 'sink') {
        return;
      }
      const count = labelDictionary[label].count;
      labelDictionary[label].count = count + 1;
    });
  });
  return [
    {
      label: 'Featured',
      count: fullSet.filter((item) => item.featured_rank > 0).length,
    },
    ...categories.map((category) => labelDictionary[category]),
  ];
}

/**
 * create functions from the current parameter to sort the returned
 * data set and kind of behave like the real backend.
 * @param orderBy
 * @returns
 */
function createSortFunctions(orderBy) {
  return orderBy
    .split(',')
    .map((criteria: string) => {
      const [key, order] = criteria.trim().split(' ');
      const sortOrder = order === 'asc' ? 1 : -1;
      return (a: FeaturedConnectorType, b: FeaturedConnectorType) => {
        const aProp = a[key];
        const bProp = b[key];
        switch (typeof aProp) {
          case 'string':
            return (
              (aProp || '')
                .toLocaleLowerCase()
                .localeCompare((bProp || '').toLocaleLowerCase()) * sortOrder
            );
          case 'number':
            return (aProp < bProp ? -1 : aProp > bProp ? 1 : 0) * sortOrder;
          default:
            return 0; // not currently supported
        }
      };
    })
    .reverse();
}

/**
 * Create some simple filter functions that kind of behave like the real
 * backend.
 * @param search
 * @returns
 */
function createFilterFunctions(search) {
  return search
    .split(' AND ')
    .map((str) => {
      const trimmed = str.trim();
      if (trimmed[0] === '(' && trimmed[trimmed.length - 1] === ')') {
        return trimmed.slice(1, trimmed.length - 1);
      }
      return trimmed;
    })
    .map((trimmed) => {
      const operator = ['ILIKE', 'OR', '='].reduce((prev, current) => {
        if (prev === '') {
          return trimmed.includes(current) ? current : '';
        }
        return prev;
      }, '');
      return {
        operator,
        criteria: trimmed.trim(),
      };
    })
    .map(({ criteria, operator }) => {
      switch (operator) {
        case 'ILIKE':
          // this is really to handle the name search
          const [field, term] = criteria
            .split('ILIKE')
            .map((part) => part.trim());
          return (connectorType: FeaturedConnectorType) => {
            return (connectorType[field] || '').toLocaleLowerCase().includes(
              // pretend to act like SQL % search operator
              term.slice(2, term.length - 2).toLocaleLowerCase()
            );
          };
        // this deals with the label filtering
        case 'OR':
          const criterias = criteria.split('OR').map((part) => part.trim());
          const funcs = criterias.map((orCriteria) => {
            return createOrCriteriaFunction(orCriteria);
          });
          return (connectorType: FeaturedConnectorType) => {
            return funcs.every((func) => func(connectorType));
          };
        // this catches the case where only label filtering happens
        case '=':
          return createOrCriteriaFunction(criteria);
        default:
          // or no search at all
          console.log(
            'Unknown operator: ',
            operator,
            ' for criteria: ',
            criteria
          );
          return () => {
            return true;
          };
      }
    });
}

function createOrCriteriaFunction(orCriteria: string) {
  const [field, term] = orCriteria.split(' = ').map((str) => str.trim());
  return (connectorType: FeaturedConnectorType) => {
    const targetField = connectorType[field] || connectorType[`${field}s`]; // such a hack
    switch (typeof targetField) {
      case 'string':
        return targetField === term;
      case 'object':
        return (targetField as Array<string>).includes(term);
      default:
        return true;
    }
  };
}
