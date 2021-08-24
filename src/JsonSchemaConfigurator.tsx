import Ajv, { ValidateFunction } from 'ajv';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { DeepPartial, useForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields, AutoForm, ErrorsField } from 'uniforms-patternfly';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: false,
  strict: 'log',
  strictSchema: false,
});

export function createValidator(schema: object) {
  const validator = ajv.compile(schema);

  return (model: object) => {
    validator(model);
    return validator.errors?.length ? { details: validator.errors } : null;
  };
}

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
    const schemaValidator = createValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);
    return (
      <AutoForm
        schema={bridge}
        model={configuration}
        autosave
        autosaveDelay={0}
      >
        <AutoFields />
        <ErrorsField />
        <WizardNext onChange={onChange} />
      </AutoForm>
    );
  };

const WizardNext: FunctionComponent<{
  onChange: (data: unknown, isValid: boolean) => void;
}> = ({ onChange }) => {
  const { changed, submitted, error, model } = useForm();
  const isValid = !error;
  const prevChangeModel = useRef<DeepPartial<unknown>>();
  useEffect(() => {
    if (prevChangeModel.current !== model && changed && submitted) {
      prevChangeModel.current = model;
      onChange(isValid ? model : undefined, isValid);
    }
  }, [prevChangeModel, changed, submitted, isValid, model, onChange]);
  return null;
};
