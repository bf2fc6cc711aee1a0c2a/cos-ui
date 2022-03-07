import { Resolver } from '@stoplight/json-ref-resolver';
import { createValidator } from '@utils/createValidator';
import { ValidateFunction } from 'ajv';
import _ from 'lodash';
import React, { FunctionComponent } from 'react';
import { AutoForm, ValidatedQuickForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoField } from 'uniforms-patternfly';

import { Grid } from '@patternfly/react-core';

import './JsonSchemaConfigurator.css';

export type CreateValidatorType = ReturnType<typeof createValidator>;
export type ValidatorResultType = ValidateFunction<unknown>['errors'];

type JsonSchemaConfiguratorProps = {
  schema: Record<string, any>;
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
  editCase?: boolean;
};
const resolver = new Resolver();

// const isFieldDisabled = () => {

// }

export const JsonSchemaConfigurator: FunctionComponent<JsonSchemaConfiguratorProps> =
  ({ schema, configuration, onChange }) => {
    schema.type = schema.type || 'object';
    // Suppress the experimental steps from the UI for the moment
    try {
      delete schema.properties.steps;
    } catch (e) {}

    const schemaValidator = createValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);
    const { required } = bridge.schema;

    async function getDataShape(): Promise<any> {
      const copiedBridge = JSON.parse(JSON.stringify(bridge));
      let obj: any = [];
      for (const [key] of Object.entries(
        copiedBridge.schema.properties.data_shape?.properties
      )) {
        const dataShapeReolved = await resolver.resolve(copiedBridge.schema, {
          jsonPointer: `#/$defs/data_shape/${key}`,
        });
        const result = await dataShapeReolved.result;
        obj = { ...obj, [key]: result };
      }
      return obj;
    }

    const onChangeWizard = async (model: any, isValid: boolean) => {
      const copiedModel = JSON.parse(JSON.stringify(model));
      let dataShapePointer: any = [];
      if (copiedModel.data_shape !== undefined) {
        dataShapePointer = await getDataShape();
        const { data_shape } = copiedModel;
        Object.keys(data_shape).map((key) => {
          const defaultValue =
            dataShapePointer[key].properties?.format?.default;
          if (_.isEmpty(data_shape[key])) {
            copiedModel.data_shape[key] = { format: defaultValue };
          }
        });
      }

      const requiredEntries = {};
      for (const [key, value] of Object.entries(copiedModel)) {
        for (const r in required) {
          if (key === required[r] && value !== undefined) {
            const obj = { [key]: value };
            Object.assign(requiredEntries, obj);
          }
        }
      }
      const compareRequiredEntriesKeys = (
        requiredEntries: any,
        required: any
      ) => {
        const aKeys = Object.keys(requiredEntries).sort();
        const bKeys = required.slice().sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
      };
      isValid =
        copiedModel.data_shape === undefined
          ? compareRequiredEntriesKeys(requiredEntries, required)
          : compareRequiredEntriesKeys(requiredEntries, required);

      if (isValid) {
        onChange(copiedModel, isValid);
      } else {
        onChange(copiedModel, false);
      }
    };
    return (
      <Grid hasGutter>
        <KameletForm
          schema={bridge}
          model={configuration}
          onChangeModel={(model: any) => onChangeWizard(model, false)}
          className="connector-specific pf-c-form pf-m-9-col-on-lg"
        >
          {Object.keys(bridge.schema.properties).map((key) => {
            if (!['processors', 'error_handler'].includes(key)) {
              return (
                <AutoField
                  key={key}
                  name={key}
                  disabled={bridge.schema.properties[key].oneOf}
                />
              );
            }
            return false;
          })}
        </KameletForm>
      </Grid>
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
