import _ from 'lodash';

export const mapToObject = (inputMap: Map<string, unknown>): object => {
  const obj = {} as { [key: string]: unknown };
  inputMap.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

/**
 * Simple reference resolver that works with references contained in the
 * same schema object
 * @param ref
 * @param schema
 * @returns
 */
export const resolveReference = (ref: string, schema: Record<string, any>) => {
  const [_, ...pathArray] = ref.split('/');
  return pathArray.reduce((prev, key) => prev && prev[key], schema);
};

/**
 * Get whatever the default value is for a given property in the given
 * schema recursively
 * @param propertyName
 * @param schema
 * @returns
 */
export const createDefaultFromSchema = (
  propertyName: string,
  schema: Record<string, any>
) => {
  const prop = schema.properties[propertyName];
  if (typeof prop === 'undefined') {
    return undefined;
  }
  const definition = prop.$ref
    ? resolveReference(prop.$ref, schema)
    : schema.properties[propertyName];
  if (!definition.properties) {
    return definition.default;
  }
  const answer: any = {};
  Object.keys(definition.properties).map((key) => {
    const value = createDefaultFromSchema(key, {
      $defs: schema.$defs,
      ...(definition || {}),
    });
    if (typeof value !== 'undefined') {
      answer[key] = value;
    }
  });
  return answer;
};

/**
 * Returns a new object that does not contain empty objects as values
 * and leaves the passed in value untouched.
 * @param obj
 * @returns
 */
export const clearEmptyObjectValues = (obj: any): any => {
  const answer: any = { ...obj };
  Object.keys(answer).map((key) => {
    const value = answer[key];
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      answer[key] = '';
    }
  });
  return answer;
};

/**
 * Applies client-side workarounds to possible discrepencies in the configuration.
 *
 * Applies a default datashape value from the schema if the configuration object doesn't have one.
 *
 * @param schema
 * @param configuration
 * @returns
 */
export const patchConfigurationObject = (
  schema: Record<string, any>,
  configuration: { data_shape: any; [key: string]: any }
) => {
  const { data_shape: dataShape, ...rest } = configuration;
  if (typeof dataShape === 'undefined') {
    const dataShape = createDefaultFromSchema('data_shape', schema);
    return { ...rest, ...(dataShape && { data_shape: dataShape }) };
  }
  return configuration;
};
