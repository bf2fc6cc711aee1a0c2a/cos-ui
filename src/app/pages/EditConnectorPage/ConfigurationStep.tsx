import { JsonSchemaConfigurator } from '@app/components/JsonSchemaConfigurator/JsonSchemaConfigurator';
import React from 'react';
import { FC } from 'react';

export type ConfigurationStepProps = {
  schema: Record<string, any>;
  configuration: unknown;
  // onChange: (configuration: unknown, isValid: boolean) => void
};
export const ConfigurationStep: FC<ConfigurationStepProps> = ({
  schema,
  configuration,
}) => {
  const onChange = (config: unknown, isValid: boolean) => {
    console.log('Data', config, isValid);
  };
  return (
    <JsonSchemaConfigurator
      schema={schema}
      configuration={configuration || {}}
      onChange={onChange}
    />
  );
};
