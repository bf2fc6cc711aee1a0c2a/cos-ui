import { filterEdgeCases } from '@app/components/JsonSchemaConfigurator/JsonSchemaConfigurator';
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: false,
  strict: 'log',
  strictSchema: false,
});
ajv.addVocabulary(['options', 'uniforms']);
export function createValidator(schema: object) {
  const validator = ajv.compile(schema);

  return (model: object) => {
    validator(model);
    return validator.errors?.length
      ? { details: validator.errors }
      : { details: [] };
  };
}

export const validateAgainstSchema = (
  schemaValidator: CreateValidatorType,
  schema: Record<string, any>,
  model: unknown
): boolean => {
  const { required } = schema;
  const details = filterEdgeCases(
    required,
    schemaValidator(model as object).details
  );
  return details.length === 0;
};

export type CreateValidatorType = ReturnType<typeof createValidator>;
