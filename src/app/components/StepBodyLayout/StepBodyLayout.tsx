import React, { FunctionComponent, ReactNode } from 'react';

import { Level, LevelItem, Title } from '@patternfly/react-core';

import './StepBodyLayout.css';

type CreateConnectorWizardBodyLayoutProps = {
  title: string;
  component?: ReactNode;
  description?: ReactNode;
};
export const StepBodyLayout: FunctionComponent<CreateConnectorWizardBodyLayoutProps> =
  ({ title, description, component, children }) => (
    <div className={'pf-l-stack'}>
      <div className={'pf-l-stack__item pf-u-p-md'}>
        <Level>
          <LevelItem>
            <Title headingLevel="h2">{title}</Title>
          </LevelItem>
          <LevelItem>{component}</LevelItem>
        </Level>
        {(() => {
          switch (typeof description) {
            case 'string':
              return <p className="wizard-step__description">{description}</p>;
            default:
              return description;
          }
        })()}
      </div>
      <div className="pf-l-stack__item pf-l-stack pf-m-fill pf-u-pl-md pf-u-pr-md  pf-u-pb-md">
        {children}
      </div>
    </div>
  );
