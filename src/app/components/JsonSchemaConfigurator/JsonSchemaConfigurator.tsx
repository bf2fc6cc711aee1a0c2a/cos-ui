import { createValidator } from '@utils/createValidator';
import { clearEmptyObjectValues } from '@utils/shared';
import { ValidateFunction } from 'ajv';
import _ from 'lodash';
import React, { FunctionComponent } from 'react';
import { AutoForm, ValidatedQuickForm } from 'uniforms';
import { AutoField } from 'uniforms-patternfly';

import { Grid } from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { CustomJsonSchemaBridge } from './CustomJsonSchemaBridge';
import './JsonSchemaConfigurator.css';
import { TypeaheadField } from './TypeaheadField';

export type CreateValidatorType = ReturnType<typeof createValidator>;
export type ValidatorResultType = ValidateFunction<unknown>['errors'];

type JsonSchemaConfiguratorProps = {
  schema: Record<string, any>;
  configuration: unknown;
  duplicateMode?: boolean;
  editMode?: boolean;
  onChange: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator: FunctionComponent<JsonSchemaConfiguratorProps> =
  ({ schema, configuration, duplicateMode, editMode, onChange }) => {
    const { t } = useTranslation();
    schema.type = schema.type || 'object';
    const { required } = schema;

    const schemaValidator = createValidator(schema);
    const bridge = new CustomJsonSchemaBridge(
      schema,
      schemaValidator,
      t,
      duplicateMode || editMode || false,
      duplicateMode || false
    );

    const onChangeModel = async (model: any) => {
      // schemaValidator returns null when there's no errors in the form
      const errors = (schemaValidator(model) || { details: [] }).details.filter(
        ({ instancePath, /* schemaPath, keyword, params, */ message }) => {
          // Deal with validation edge cases
          switch (message) {
            // these cases are valid when the property is
            // not required, in this case the value is set
            // to null
            case 'must be string':
            case 'must be number':
              return (
                ((required as string[]) || []).filter((req) =>
                  instancePath.endsWith(req)
                ).length > 0
              );
          }
          return true;
        }
      );
      onChange(model, errors.length === 0);
    };

    // no need to create form elements for error_handler, processors or steps
    const { error_handler, processors, steps, ...properties } =
      bridge.schema.properties;
    // apply global customizations across all schema based forms
    const {
      kafka_topic,
      aws_access_key,
      aws_secret_key,
      aws_region,
      data_shape,
      ...otherProperties
    } = properties;
    // customize field components as needed
    aws_region
      ? (aws_region.uniforms = {
          component: TypeaheadField,
        })
      : undefined;
    // broadly organize some properties across all forms if applicable
    const organizedProperties = {
      ...(kafka_topic && { kafka_topic }),
      ...(aws_access_key && { aws_access_key }),
      ...(aws_secret_key && { aws_secret_key }),
      ...(aws_region && { aws_region }),
      ...otherProperties,
      ...(data_shape && { data_shape }),
    };
    return (
      <Grid hasGutter>
        <KameletForm
          schema={bridge}
          model={clearEmptyObjectValues(configuration)}
          onChangeModel={(model: any) => onChangeModel(model)}
          className="connector-specific pf-c-form pf-m-9-col-on-lg"
        >
          {Object.keys(organizedProperties).map((propertyName) => (
            <AutoField key={propertyName} name={propertyName} />
          ))}
        </KameletForm>
      </Grid>
    );
  };
function Auto(parent: any): any {
  class _ extends AutoForm.Auto(parent) {
    static Auto = Auto;
    onChange(key: string, value: unknown) {
      if (value === '') return super.onChange(key, null);
      return super.onChange(key, value);
    }
  }
  return _;
}
const KameletForm = Auto(ValidatedQuickForm);
