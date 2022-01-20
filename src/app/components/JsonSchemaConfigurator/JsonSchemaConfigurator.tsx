import Ajv, { ValidateFunction } from 'ajv';
import React, { FunctionComponent } from 'react';
import { AutoForm, ValidatedQuickForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields, SubmitField } from 'uniforms-patternfly';

import { Card, CardBody } from '@patternfly/react-core';

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
    // suppress the experimental steps from the UI for the moment
    try {
      delete schema.properties.steps;
    } catch (e) {}
    const schemaValidator = createValidator(schema);
    const bridge = new JSONSchemaBridge(schema, schemaValidator);
    return (
      <KameletForm
        schema={bridge}
        model={configuration}
        onChangeModel={(model: any) => onChange(model, false)}
        onSubmit={(model: any) => onChange(model, true)}
        // autosave
        // autosaveDelay={0}
      >
        <AutoFields />

        <Card isPlain>
          <CardBody>
            {/*
            // @ts-expect-error */}
            <SubmitField value={'Verify configuration'} />
          </CardBody>
        </Card>
        {/* <WizardNext onChange={onChange} /> */}
      </KameletForm>
    );
  };

// const WizardNext: FunctionComponent<{
//   onChange: (data: unknown, isValid: boolean) => void;
// }> = ({ onChange }) => {
//   const { changed, submitted, error, model } = useForm();
//   const isValid = !error;
//   const prevChangeModel = useRef<DeepPartial<unknown>>();
//   useEffect(() => {
//     if (prevChangeModel.current !== model && changed && submitted) {
//       prevChangeModel.current = model;
//       onChange(, isValid);
//     }
//   }, [prevChangeModel, changed, submitted, isValid, model, onChange]);
//   return null;
// };

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
