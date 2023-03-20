import { Gallery } from '@patternfly/react-core';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { CreateNamespaceCard } from './CreateNamespaceCard';

export default {
  title: 'Wizard Step 3/Cards',
  component: CreateNamespaceCard,
  decorators: [
    (Story) => (
      <div className={'pf-l-stack__item pf-m-fill'}>
        <Gallery hasGutter>
          <Story />
        </Gallery>
      </div>
    ),
  ],
} as ComponentMeta<typeof CreateNamespaceCard>;

export const CreateNamespace: ComponentStory<typeof CreateNamespaceCard> = () => (
  <CreateNamespaceCard />
);
