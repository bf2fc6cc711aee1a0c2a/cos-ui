import React, { FunctionComponent, ReactNode } from 'react';

import { Level, LevelItem, Title } from '@patternfly/react-core';

type CreateConnectorWizardBodyLayoutProps = {
  title: string;
  component?: ReactNode;
  description?: ReactNode;
};
export const StepBodyLayout: FunctionComponent<CreateConnectorWizardBodyLayoutProps> =
  ({ title, description, component, children }) => (
    <div className={'pf-l-stack'}>
      <Level className={'pf-u-p-md pf-l-stack__item'}>
      <LevelItem>
        <Title headingLevel="h2">{title}</Title>
      </LevelItem>
      <LevelItem>{component}</LevelItem>
        {(() => {
          switch (typeof description) {
            case 'string':
              return <p>{description}</p>;
            default:
              return description;
          }
        })()}
      </Level>
      <div className={'pf-l-stack__item pf-l-stack pf-m-fill'}>{children}</div>
    </div>
  );