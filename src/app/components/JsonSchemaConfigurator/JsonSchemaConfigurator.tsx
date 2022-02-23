// import { Resolver } from '@stoplight/json-ref-resolver';
import { createValidator } from '@utils/createValidator';
import { ValidateFunction } from 'ajv';
import React, { FunctionComponent } from 'react';
import { AutoForm, ValidatedQuickForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields } from 'uniforms-patternfly';

import { Card, CardBody } from '@patternfly/react-core';

import './JsonSchemaConfigurator.css';

// var pointer = require('json-pointer');

export type CreateValidatorType = ReturnType<typeof createValidator>;
export type ValidatorResultType = ValidateFunction<unknown>['errors'];

type JsonSchemaConfiguratorProps = {
  schema: Record<string, any>;
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator: FunctionComponent<JsonSchemaConfiguratorProps> =
  ({ schema, configuration, onChange }) => {
    schema.type = schema.type || 'object';
    // Suppress the experimental steps from the UI for the moment
    try {
      delete schema.properties.steps;
    } catch (e) {}

    const schemaValidator = createValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);

    const onChangeWizard = async (model: any, isValid: boolean) => {
      const { required } = bridge.schema;

      const requiredEntries = {};
      for (const [key, value] of Object.entries(model)) {
        for (const r in required) {
          if (key === required[r] && value !== undefined) {
            const obj = { [key]: value };
            Object.assign(requiredEntries, obj);
          }
        }
      }
      const compareRequiredEntriesKeys = (a: any, b: any) => {
        const aKeys = Object.keys(a).sort();
        const bKeys = b.slice().sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
      };
      isValid =
        model.data_shape === undefined
          ? compareRequiredEntriesKeys(requiredEntries, required)
          : compareRequiredEntriesKeys(requiredEntries, required) &&
            Object.keys(model.data_shape.produces).length > 0;
      onChange(model, isValid);
    };
    return (
      <KameletForm
        schema={bridge}
        model={configuration}
        onChangeModel={(model: any) => onChangeWizard(model, false)}
        className="configurator"
      >
        <Card isPlain>
          <CardBody>
            <AutoFields omitFields={['processors', 'error_handler']} />
          </CardBody>
        </Card>
      </KameletForm>
    );
  };
function Auto(parent: any): any {
  class _ extends AutoForm.Auto(parent) {
    static Auto = Auto;
    onChange(key: string, value: unknown) {
      if (value === '') return super.onChange(key, undefined);
      super.onChange(key, value);
    }
  }
  return _;
}

const KameletForm = Auto(ValidatedQuickForm);
