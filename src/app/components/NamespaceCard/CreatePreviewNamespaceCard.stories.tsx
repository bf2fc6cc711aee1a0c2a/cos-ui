import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Gallery } from '@patternfly/react-core';

import { CreatePreviewNamespaceCard } from './CreatePreviewNamespaceCard';

export default {
  title: 'Wizard Step 3/Cards',
  component: CreatePreviewNamespaceCard,
  decorators: [
    (Story) => (
      <div className={'pf-l-stack__item pf-m-fill'}>
        <Gallery hasGutter>
          <Story />
        </Gallery>
      </div>
    ),
  ],
} as ComponentMeta<typeof CreatePreviewNamespaceCard>;

const Temp: ComponentStory<typeof CreatePreviewNamespaceCard> = (args) => (
  <CreatePreviewNamespaceCard {...args} />
);

export const CreatePreviewNamespace = Temp.bind({});

CreatePreviewNamespace.args = {
  classNames: 'step-deployment__card',
  onModalToggle: () => undefined,
};
