import React, { FunctionComponent, ReactNode } from 'react';

import { Level, Title } from '@patternfly/react-core';

type BodyLayoutProps = {
  title: string;
  description?: ReactNode;
};
export const BodyLayout: FunctionComponent<BodyLayoutProps> = ({
  title,
  description,
  children,
}) => (
  <div className={'pf-l-stack'}>
    <Level className={'pf-u-p-md pf-l-stack__item'}>
      <Title headingLevel="h2">{title}</Title>
      {(() => {
        switch (typeof description) {
          case 'string':
            return <p>{description}</p>;
          default:
            return description;
        }
      })()}
    </Level>
    <div className={'pf-l-stack__item pf-m-fill pf-u-background-color-200'}>
      {children}
    </div>
  </div>
);
