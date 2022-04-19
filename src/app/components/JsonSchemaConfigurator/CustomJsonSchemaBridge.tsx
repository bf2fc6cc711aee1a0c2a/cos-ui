import React from 'react';
import { TFunction } from 'react-i18next';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

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
 * CustomJsonSchemaBridge generates the appropriate attributes for uniforms-patternfly
 * based on the incoming model data
 */
export class CustomJsonSchemaBridge extends JSONSchemaBridge {
  showCredentialHelpText: boolean;
  t: TFunction<'translation', undefined>;

  constructor(
    schema: any,
    validator: any,
    t: TFunction<'translation', undefined>,
    showCredentialHelpText: boolean
  ) {
    super(schema, validator);
    this.t = t;
    this.showCredentialHelpText = showCredentialHelpText;
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
      return {
        ...props,
        ...(this.showCredentialHelpText && {
          helperText: this.t('credentialFieldHelpText'),
        }),
        labelIcon: getLabelIcon(label || name, description),
        name,
        label,
        type: 'password',
      };
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
          required: field.required,
          type: 'password',
          'x-group': xGroup,
        };
      default:
        return { name, ...field };
    }
  }
}
