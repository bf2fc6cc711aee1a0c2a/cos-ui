import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { inspect } from '@xstate/inspect';

import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/BackgroundColor/BackgroundColor.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Text/text.css';

import { AppDemo } from './AppDemo';
import { AppE2E } from './AppE2E';

if (process.env.DEMO_APP) {
  inspect({
    iframe: false,
  });
  ReactDOM.render(<AppDemo />, document.getElementById('root'));
} else {
  ReactDOM.render(<AppE2E />, document.getElementById('root'));
}
