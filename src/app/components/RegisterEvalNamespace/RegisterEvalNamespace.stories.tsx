import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import { CosContextProvider } from '../../../hooks/useCos';
import { AlertsProvider } from '../Alerts/Alerts';
import { RegisterEvalNamespace } from './RegisterEvalNamespace';

const API_HOST = 'https://dummy.server';

export default {
  title: 'Wizard Step 3/CreatePreviewNamespace',
  component: RegisterEvalNamespace,
  decorators: [
    (Story) => (
      <>
        <CosContextProvider
          getToken={() => Promise.resolve('')}
          connectorsApiBasePath={API_HOST}
          kafkaManagementApiBasePath={API_HOST}
        >
          <AlertsProvider>
            <Story />
          </AlertsProvider>
        </CosContextProvider>
      </>
    ),
  ],
} as ComponentMeta<typeof RegisterEvalNamespace>;

const Template: ComponentStory<typeof RegisterEvalNamespace> = (args) => (
  <RegisterEvalNamespace {...args} />
);

export const CreatePreviewNamespaceModal = Template.bind({});
CreatePreviewNamespaceModal.args = {
  isModalOpen: true,
  onModalToggle: () => undefined,
  refreshResponse: () => undefined,
};
