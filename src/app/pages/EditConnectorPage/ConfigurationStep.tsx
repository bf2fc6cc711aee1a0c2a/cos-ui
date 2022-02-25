import { JsonSchemaConfigurator } from '@app/components/JsonSchemaConfigurator/JsonSchemaConfigurator';
import _ from 'lodash';
import React from 'react';
import { FC } from 'react';

import {
  Form,
  FormGroup,
  Popover,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export type ConfigurationType = {
  [key: string]: any;
};
export type ConfigurationStepProps = {
  editMode: boolean;
  schema: Record<string, any>;
  configuration: unknown;
  // onChange: (configuration: unknown, isValid: boolean) => void
};
export const ConfigurationStep: FC<ConfigurationStepProps> = ({
  editMode,
  schema,
  configuration,
}) => {
  console.log('Schema:', schema, 'Configuration:', configuration);

  const onChange = (config: unknown, isValid: boolean) => {
    console.log('Data', config, isValid);
  };
  return (
    <>
      {editMode ? (
        <JsonSchemaConfigurator
          schema={schema}
          configuration={configuration || {}}
          onChange={onChange}
        />
      ) : (
        <Form>
          {Object.entries(schema.properties)
            .filter(([key, value]: [string, any]) => {
              if (['object', 'array'].includes(value.type)) {
                if (key === 'data_shape') {
                  return true;
                }
                return false;
              }
              return true;
            })
            .map(
              ([key, value]: [string, any]) => (
                <FormGroup
                  key={key}
                  label={value.title || key.replace('_', ' ')}
                  fieldId={key}
                  isRequired={schema.required.includes(key)}
                  labelIcon={
                    value.description && (
                      <Popover bodyContent={<p>{value.description}</p>}>
                        <button
                          type="button"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="simple-form-name-01"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </button>
                      </Popover>
                    )
                  }
                >
                  <Text component={TextVariants.p}>
                    {_.isObject((configuration as ConfigurationType)[key])
                      ? JSON.stringify(
                          (configuration as ConfigurationType)[key]
                        )
                      : (configuration as ConfigurationType)[key]}
                  </Text>
                </FormGroup>
              )
            )}
        </Form>
      )}
    </>
  );
};
