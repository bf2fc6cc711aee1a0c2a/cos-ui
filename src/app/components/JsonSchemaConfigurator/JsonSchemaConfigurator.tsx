import { createValidator } from '@utils/createValidator';
import {
  applyClientSideFormCustomizations,
  clearEmptyObjectValues,
} from '@utils/shared';
import { ErrorObject, ValidateFunction } from 'ajv';
import jsonpointer from 'jsonpointer';
import { capitalize, forEach } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';
import { AutoForm, ValidatedQuickForm } from 'uniforms';
import { AutoField } from 'uniforms-patternfly';

import { Grid } from '@patternfly/react-core';

import { TFunction, useTranslation } from '@rhoas/app-services-ui-components';

import { CheckboxWithDescriptionField } from './CheckboxWithDescriptionField';
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

    const onValidate = useCallback(
      (model: any, error: any) => {
        const details = overrideErrorMessages(
          t,
          filterEdgeCases(required, error.details),
          model
        );
        return { ...error, details };
      },
      [schema]
    );

    const onChangeModel = useCallback(
      (model: any) => {
        const details = filterEdgeCases(
          required,
          schemaValidator(model).details
        );
        onChange(model, details.length === 0);
      },
      [onChange]
    );

    // no need to create form elements for error_handler, processors or steps
    const { error_handler, processors, steps, ...properties } =
      bridge.schema.properties;
    // customize field components as needed
    const { aws_region, ...otherProperties } = properties;
    aws_region && aws_region.enum
      ? (aws_region.uniforms = {
          component: TypeaheadField,
        })
      : undefined;

    forEach(otherProperties, (val: any, key: string) => {
      val.type === 'boolean'
        ? (otherProperties[key].uniforms = {
            component: CheckboxWithDescriptionField,
          })
        : undefined;
    });

    const organizedProperties = applyClientSideFormCustomizations({
      ...otherProperties,
      ...(aws_region && { aws_region }),
    });
    return (
      <Grid hasGutter>
        <KameletForm
          className="connector-specific pf-c-form pf-m-9-col-on-lg"
          schema={bridge}
          model={clearEmptyObjectValues(configuration)}
          onValidate={onValidate}
          validate={'onChange'}
          onChangeModel={onChangeModel}
          showInlineError
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

/**
 * Customizes and overrides validation error messages before they're
 * made visible to the user.
 * @param t
 * @param details
 * @returns
 */
function overrideErrorMessages(
  t: TFunction<'translation', undefined>,
  details: Array<ErrorObject<string, Record<string, any>, unknown>>,
  model: any
) {
  return details
    .map((detail) => {
      const { instancePath, keyword } = detail;
      switch (keyword) {
        case 'required':
          return { ...detail, message: t('pleaseEnterAValue') };
        case 'type':
          const value = jsonpointer.get(model, instancePath);
          if (value === null) {
            return { ...detail, message: t('pleaseEnterAValue') };
          }
          break;
        default:
          break;
      }
      return { ...detail, message: capitalize(detail.message) };
    })
    .filter((detail) => {
      const { keyword, params } = detail;
      switch (keyword) {
        case 'required':
          if (params.missingProperty) {
            const value = model[params.missingProperty];
            if (typeof value === 'undefined') {
              return false;
            }
          }
          break;
        default:
          break;
      }
      return true;
    });
}

/**
 * Deals with the one edge case where a non-required field is set to
 * empty and therefore a null value.
 * @param required
 * @param details
 * @returns
 */
function filterEdgeCases(
  required: string[],
  details: Array<ErrorObject<string, Record<string, any>, unknown>>
) {
  return details.filter(({ instancePath, message }) => {
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
  });
}
