import { ComponentMeta, ComponentStory } from '@storybook/react';
import { rest } from 'msw';
import Prando from 'prando';
import React, { FC, useState } from 'react';

import locales from '../../../../locales/en/cos-ui.json';
import { CosContextProvider } from '../../../hooks/useCos';
import { StepBodyLayout } from '../StepBodyLayout/StepBodyLayout';
import {
  ConnectorSelectionList,
  ConnectorSelectionListInnerProps,
} from './ConnectorSelectionList';
import { ConnectorSelectionListCacheStorageProvider } from './ConnectorSelectionListCacheStorage';
import { FeaturedConnectorType } from './typeExtensions';

const API_HOST = 'https://dummy.server';

const SelectionViewInner: FC<ConnectorSelectionListInnerProps> = ({
  renderSelectionList,
}) => {
  const [selectedId, onSelect] = useState<string | undefined>(undefined);
  return renderSelectionList({
    selectedId,
    onSelect: (connector) => {
      console.log('Selected connector: ', connector);
      onSelect(connector.id!);
    },
  });
};

export default {
  title: 'Wizard Step 1/Connector Type Step',
  component: ConnectorSelectionList,
  decorators: [
    (Story) => (
      <>
        <StepBodyLayout title={'Connectors'}>
          <CosContextProvider
            getToken={() => Promise.resolve('')}
            connectorsApiBasePath={API_HOST}
            kafkaManagementApiBasePath={API_HOST}
          >
            <ConnectorSelectionListCacheStorageProvider>
              <Story />
            </ConnectorSelectionListCacheStorageProvider>
          </CosContextProvider>
        </StepBodyLayout>
      </>
    ),
  ],
  args: {
    renderSelector: (renderSelectionList) => (
      <SelectionViewInner renderSelectionList={renderSelectionList} />
    ),
  },
} as ComponentMeta<typeof ConnectorSelectionList>;

const Template: ComponentStory<typeof ConnectorSelectionList> = (args) => (
  <ConnectorSelectionList {...args} />
);

const categories = [
  'category-featured',
  'category-ai-machine-learning',
  'category-serverless',
  'category-big-data',
  'category-database',
  'category-change-data-capture',
  'category-developer-tools',
  'category-integration-and-delivery',
  'category-logging',
  'category-monitoring',
  'category-crm',
  'category-storage',
  'category-streaming-and-messaging',
  'category-amazon',
  'category-google',
  'category-azure',
];

const pricingTiers = ['free', 'essentials', 'plus'];

const PRICING_TIER_ANNOTATION = 'cos.bf2.org/pricing-tier';

const CONNECTOR_COUNT = 235;
const FEATURED_COUNT = 5;
const CONNECTOR_TYPES_API = `${API_HOST}/api/connector_mgmt/v1/kafka_connector_types`;
const CONNECTOR_LABELS_API = `${API_HOST}/api/connector_mgmt/v1/kafka_connector_types/labels`;

export const InitialLoadingState = Template.bind({});
InitialLoadingState.args = {};
InitialLoadingState.parameters = {
  msw: [
    rest.get(`${CONNECTOR_LABELS_API}*`, (_req, res, ctx) => {
      return res(ctx.delay('infinite'));
    }),
    rest.get(`${CONNECTOR_TYPES_API}*`, (_req, res, ctx) => {
      return res(ctx.delay('infinite'));
    }),
  ],
};

export const WithPartialLoading = Template.bind({});
WithPartialLoading.args = {};
WithPartialLoading.parameters = {
  msw: [
    rest.get(`${CONNECTOR_LABELS_API}*`, (req, res, ctx) => {
      const { search, orderBy } = getPaginationCriteria(req.url.searchParams);
      const response = generateConnectorTypeLabelsResponse(
        search,
        orderBy,
        CONNECTOR_COUNT
      );
      console.log('Returning labels response: ', response);
      return res(ctx.delay(), ctx.json(response));
    }),
    rest.get(`${CONNECTOR_TYPES_API}*`, (req, res, ctx) => {
      const { page, size, search, orderBy } = getPaginationCriteria(
        req.url.searchParams
      );
      if (page > 1) {
        return res(ctx.delay('infinite'));
      }
      const response = generateConnectorTypesResponse(
        page,
        size,
        search,
        orderBy,
        CONNECTOR_COUNT
      );
      console.log('Returning ConnectorTypes response: ', response);
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithConnectors = Template.bind({});
WithConnectors.args = {};
WithConnectors.parameters = {
  msw: [
    rest.get(`${CONNECTOR_LABELS_API}*`, (req, res, ctx) => {
      const { search, orderBy } = getPaginationCriteria(req.url.searchParams);
      const response = generateConnectorTypeLabelsResponse(
        search,
        orderBy,
        CONNECTOR_COUNT
      );
      console.log(
        'Received parameters search: ',
        search,
        ' orderBy: ',
        orderBy,
        ' returning labels API response: ',
        response
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
      console.log(
        'Received parameters search: ',
        search,
        ' orderBy: ',
        orderBy,
        ' returning ConnectorTypes API response: ',
        response
      );
      return res(ctx.delay(), ctx.json(response));
    }),
  ],
};

export const WithErrors = Template.bind({});
InitialLoadingState.args = {};
InitialLoadingState.parameters = {
  msw: [
    rest.get(`${CONNECTOR_LABELS_API}*`, (_req, res, ctx) => {
      return res(ctx.status(403));
    }),
    rest.get(`${CONNECTOR_TYPES_API}*`, (_req, res, ctx) => {
      return res(ctx.status(403));
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
    items: items.length ? items : null,
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
    const filteredCategories = categories.filter(
      (category) => category !== 'category-featured'
    );
    const answer = Array.from(
      { length: numLabels },
      () => filteredCategories[rng.nextInt(0, filteredCategories.length - 1)]
    );
    return answer.filter((val, index, self) => self.indexOf(val) === index);
  }

  const fullSet = Array.from(
    {
      length: total,
    },
    (_, index) => {
      const labels = determineLabels();
      const versionLabel = labels[rng.nextInt(0, labels.length - 1)];
      const version = `${(locales[versionLabel] || versionLabel)
        .split(' ')
        .join('-')
        .replace('/', '_')
        .replace('&', '_')}_0.${index}${
        rng.nextBoolean() ? '' : ' alpha'
      }`.toLocaleLowerCase();
      const type = rng.nextBoolean() ? 'source' : 'sink';
      const name = `${labels
        .map((label) => locales[label] || label)
        .join(' ')} ${type === 'source' ? 'Source' : 'Sink'}`;
      return {
        name,
        id: `${name.split(' ').join('-').toLocaleLowerCase()}-${index}`,
        version,
        annotations: {
          [PRICING_TIER_ANNOTATION]:
            pricingTiers[rng.nextInt(0, pricingTiers.length - 1)],
        },
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
    const entry = fullSet[rng.nextInt(0, fullSet.length - 1)];
    entry.featured_rank = rng.nextInt(1, 10);
    entry.labels.push('category-featured');
  }
  // this is a great line to comment out when debugging react-virtualized
  // related loading problems
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
  return [...categories.map((category) => labelDictionary[category])];
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
    .map((expression) => {
      // good debugging point
      // console.log('Search expression: ', expression);
      const operator = ['ILIKE', 'LIKE', '='].reduce((prev, current) => {
        if (prev === '') {
          return expression.includes(current) ? current : '';
        }
        return prev;
      }, '');
      return {
        operator,
        criteria: expression.trim(),
      };
    })
    .map(({ criteria, operator }: { criteria: string; operator: string }) => {
      switch (operator) {
        case 'ILIKE': {
          // this is really to handle the name search
          const [field, term] = criteria
            .split('ILIKE')
            .map((part) => part.trim());
          // this assumes a format like '%term%'
          const comparatorTerm = term.slice(2, term.length - 2);
          switch (field) {
            // pricing_tier is a special search field
            case 'pricing_tier':
              return (connectorType: FeaturedConnectorType) => {
                const annotation =
                  connectorType.annotations![PRICING_TIER_ANNOTATION];
                return comparatorTerm === annotation;
              };
            default:
              return (connectorType: FeaturedConnectorType) => {
                // good debugging spot
                /*
                console.log(
                  'Checking field: ',
                  field,
                  ' with value: ',
                  connectorType[field],
                  ' against: ',
                  comparatorTerm
                );
                */
                return (connectorType[field] || '')
                  .toLocaleLowerCase()
                  .includes(
                    // pretend to act like SQL % search operator
                    comparatorTerm.toLocaleLowerCase()
                  );
              };
          }
        }
        // this deals with the label filtering
        case 'LIKE': {
          const [field, term] = criteria
            .split('LIKE')
            .map((part) => part.trim());
          const terms = term
            .split('%')
            .filter((part: string) => part.length > 0)
            .map((part) => part.trim());
          // helpful debugging point
          // console.log('Field: ', field, ' term: ', term, ' criterias: ', terms);
          const funcs = terms.map((term) => {
            return createCriteriaFunction(field, term);
          });
          return (connectorType: FeaturedConnectorType) => {
            return funcs.every((func) => func(connectorType));
          };
        }
        // this catches the case where only label filtering happens
        case '=': {
          const [field, term] = criteria.split('=').map((part) => part.trim());
          return createCriteriaFunction(field, term);
        }
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

function createCriteriaFunction(field: string, term: string) {
  return (connectorType: FeaturedConnectorType) => {
    const targetField = connectorType[field] || connectorType[`${field}s`]; // such a hack
    // helpful debugging point
    /*
    console.log(
      'Checking field: ',
      field,
      ' for term: ',
      term,
      ' against field value: ',
      targetField,
      ' connectorType: ',
      connectorType
    );
    */
    switch (typeof targetField) {
      case 'string':
        return targetField.includes(term);
      case 'object':
        return (targetField as Array<string>).includes(term);
      default:
        // this really isn't the right way to behave, but until a field with a number is used...
        return true;
    }
  };
}
