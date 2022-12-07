import React, { FunctionComponent, ReactNode } from 'react';

import {
  Level,
  LevelItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import './StepBodyLayout.css';

type CreateConnectorWizardBodyLayoutProps = {
  title: string;
  component?: ReactNode;
  description?: ReactNode;
};
export const StepBodyLayout: FunctionComponent<
  CreateConnectorWizardBodyLayoutProps
> = ({ title, description, component, children }) => (
  <Stack>
    <StackItem className={'pf-u-p-md'}>
      <Level>
        <LevelItem key="title">
          <Title headingLevel="h2">{title}</Title>
        </LevelItem>
        {component && <LevelItem key="component">{component}</LevelItem>}
      </Level>
      {description &&
        (() => {
          switch (typeof description) {
            case 'string':
              return <p className="wizard-step__description">{description}</p>;
            default:
              return description;
          }
        })()}
    </StackItem>
    <StackItem isFilled className={'pf-u-pl-md pf-u-pr-md pf-u-pb-md'}>
      {children}
    </StackItem>
  </Stack>
);
