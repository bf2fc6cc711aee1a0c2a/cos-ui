import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CosContextProvider } from '../../../hooks/useCos';
import { AlertsProvider } from '../../components/Alerts/Alerts';
import { StepCoreConfigurationInner } from './StepCoreConfiguration';

export default {
  title: 'Wizard Step 4.1/Core Configuration Step',
  component: StepCoreConfigurationInner,
  decorators: [
    (Story) => (
      <AlertsProvider>
        <CosContextProvider
          getToken={() => Promise.resolve('')}
          connectorsApiBasePath={'https://dummy.server'}
          kafkaManagementApiBasePath={'https://dummy.server.kakfa'}
        >
          <Story />
        </CosContextProvider>
      </AlertsProvider>
    ),
  ],
  args: {
    duplicateMode: false,
    name: 'Some Awesome Connector',
    sACreated: true,
    serviceAccount: {
      clientId: 'this-is-the-client-id-right-here',
      clientSecret: 'this-is-sooper-sekret-',
    },
  },
} as ComponentMeta<typeof StepCoreConfigurationInner>;

const Template: ComponentStory<typeof StepCoreConfigurationInner> = (args) => (
  <StepCoreConfigurationInner {...args} />
);

export const FilledIn = Template.bind({});
FilledIn.args = { duplicateMode: false } as ComponentMeta<
  typeof StepCoreConfigurationInner
>;

export const FilledInDuplicateMode = Template.bind({});
FilledInDuplicateMode.args = {
  duplicateMode: true,
  sAConfiguredConfirmed: true,
} as ComponentMeta<typeof StepCoreConfigurationInner>;

export const SANotCreated = Template.bind({});
SANotCreated.args = {
  sACreated: false,
  serviceAccount: undefined,
} as ComponentMeta<typeof StepCoreConfigurationInner>;
