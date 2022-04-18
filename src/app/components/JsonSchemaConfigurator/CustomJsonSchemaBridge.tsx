import React from 'react';
import { filterDOMProps } from 'uniforms';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

/**
 * Typed module to tell uniforms what properties should not be
 * applied to DOM elements.  Add entries to this whenever a lot
 * of warnings around invalid property names show up when
 * rendering a form
 */
declare module 'uniforms' {
  interface FilterDOMProps {
    additionalProperties: never;
    helperText: never;
    labelIcon: never;
  }
}

/**
 * Returns an example string formatted (not localized) for the form or undefined if the field has no example text
 * @param exampleText
 * @returns
 */
const getExampleText = (exampleText: string) =>
  typeof exampleText !== 'undefined' ? `Example: ${exampleText}` : undefined;

/**
 * Returns a label tooltip element for the form or undefined if the field has no description
 * @param name
 * @param content
 * @returns
 */
const getLabelIcon = (name: string, content: string) =>
  typeof content !== 'undefined' ? (
    <Popover bodyContent={content}>
      <button
        type="button"
        aria-label={`More info for ${name}`}
        onClick={(e) => e.preventDefault()}
        aria-describedby="form-group-label-info"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon noVerticalAlign />
      </button>
    </Popover>
  ) : undefined;

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
 * CustomJsonSchemaBridge generates the appropriate attributes for uniforms-patternfly
 * based on the incoming model data
 */
export class CustomJsonSchemaBridge extends JSONSchemaBridge {
  disableCredentials = false;

  constructor(schema: any, validator: any, disableCredentials = false) {
    super(schema, validator);
    this.disableCredentials = disableCredentials;
    filterDOMProps.register('additionalProperties', 'helperText', 'labelIcon');
  }

  /**
   * Returns the element properties for the named field.  Properties
   * that should be excluded from DOM properties should be added to
   * FilterDOMProps
   * @param name
   * @returns
   */
  getProps(name: string): any {
    const { description, example, label, ...props } = super.getProps(name);
    const { 'x-group': xGroup } = this.getField(name);
    if (xGroup === 'credentials') {
      if (this.disableCredentials) {
        props.disabled = true;
      }
      props.type = 'password';
    }
    return {
      ...props,
      helperText: getExampleText(example),
      labelIcon: getLabelIcon(label || name, description),
      name,
      label,
    };
  }

  getField(name: string): Record<string, any> {
    const { oneOf, 'x-group': xGroup, ...field } = super.getField(name);
    // use this to look at field information
    /*
    console.log(
      'Complex type, name: ',
      name,
      ' oneOf: ',
      oneOf,
      ' field: ',
      field
    );
    */
    // Due to:
    // https://uniforms.tools/docs/api-bridges/#note-on-allofanyofoneof
    // we need to pick the appropriate type for the form, let's use the
    // schema to guide these choices.
    switch (xGroup) {
      case 'credentials':
        // credentials are either a string field or an opaque object, for
        // forms let's pick the string field and override it to a password
        const [asString] = oneOf;
        return {
          ...asString,
          name,
          type: 'password',
          'x-group': xGroup,
        };
      default:
        return { name, ...field };
    }
  }
}
