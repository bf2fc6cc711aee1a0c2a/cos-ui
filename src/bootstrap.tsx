import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/BackgroundColor/BackgroundColor.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { inspect } from '@xstate/inspect';

import { DemoApp } from './DemoApp';
import { E2EApp } from './E2EApp';

if (process.env.DEMO_APP) {
  inspect({
    iframe: false,
  });
  ReactDOM.render(<DemoApp />, document.getElementById('root'));
} else {
  ReactDOM.render(<E2EApp />, document.getElementById('root'));
}
