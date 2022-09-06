import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CosContextProvider } from '../../../context/CosContext';
import { AlertsProvider } from '../Alerts/Alerts';
import { CreateServiceAccount } from './CreateServiceAccount';

export default {
  title: 'Wizard Step 4.1/Core Step/CreateServiceAccountModal',
  component: CreateServiceAccount,
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
  args: {},
} as ComponentMeta<typeof CreateServiceAccount>;

const Template: ComponentStory<typeof CreateServiceAccount> = (args) => (
  <CreateServiceAccount {...args} />
);

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  sACreated: false,

  serviceAccount: {
    clientId: '',
    clientSecret: '',
  },
} as ComponentMeta<typeof CreateServiceAccount>;

export const SACreated = Template.bind({});
SACreated.args = {
  isOpen: true,
  sACreated: true,

  serviceAccount: {
    clientId: 'srvc-acct-5bb611b1-837c-4fe6-820a-af3bc4c0aa09',
    clientSecret: 'srvc-acct-6e9df0ed-5a68-40f3-a9bf-3cbe1bfb3254',
  },
} as ComponentMeta<typeof CreateServiceAccount>;
