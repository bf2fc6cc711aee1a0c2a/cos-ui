import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/patternfly/utilities/BackgroundColor/BackgroundColor.css";
import "@patternfly/patternfly/utilities/Display/display.css";
import "@patternfly/patternfly/utilities/Flex/flex.css";
import "@patternfly/patternfly/utilities/Sizing/sizing.css";
import "@patternfly/patternfly/utilities/Spacing/spacing.css";
import "@patternfly/patternfly/utilities/Text/text.css";
import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";

import { addDecorator } from '@storybook/react'
import { initialize, mswDecorator } from 'msw-storybook-addon'

import React from 'react';
import { I18nextProvider } from '@rhoas/app-services-ui-components';
import { BrowserRouter as Router } from 'react-router-dom';

import i18n from '@i18n/i18n';

initialize()
addDecorator(mswDecorator)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: ['Pages', 'UI', 'Wizard Step 1', 'Wizard Step 3', 'Wizard Step 4.1', 'Wizard Step 4.2', 'Wizard Step 4.3', 'Wizard Step 5', 'ProofOfConcepts'],
    },
  }
};

export const decorators = [
  (Story) => (
    <Router>
      <I18nextProvider i18n={i18n}>
        <React.Suspense fallback={null}>
          <Story />
        </React.Suspense>
      </I18nextProvider>
    </Router>
  ),
];