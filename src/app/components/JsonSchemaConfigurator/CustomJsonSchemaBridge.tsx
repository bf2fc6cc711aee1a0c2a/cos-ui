import React from 'react';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { TFunction } from '@rhoas/app-services-ui-components';

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
  duplicateMode: boolean;
  t: TFunction<'translation', undefined>;

  constructor(
    schema: any,
    validator: any,
    t: TFunction<'translation', undefined>,
    showCredentialHelpText: boolean,
    duplicateMode: boolean
  ) {
    super(schema, validator);
    this.t = t;
    this.showCredentialHelpText = showCredentialHelpText;
    this.duplicateMode = duplicateMode;
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
    const { isSecret } = this.getField(name);
    if (isSecret) {
      return {
        ...props,
        ...(this.showCredentialHelpText && {
          helperText: this.duplicateMode
            ? this.t('credentialDuplicateFieldHelpText')
            : this.t('credentialEditFieldHelpText'),
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
    const { enum: enumValues, oneOf, ...field } = super.getField(name);
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
    // uniforms will show the first enum value even if the underlying
    // model object doesn't have this set or if there's no default value
    let newEnumValues = undefined;
    if (
      typeof field.type !== 'undefined' &&
      field.type === 'string' &&
      typeof enumValues !== 'undefined'
    ) {
      if (enumValues[0] !== '') {
        newEnumValues = ['', ...enumValues];
      }
    }
    // Due to:
    // https://uniforms.tools/docs/api-bridges/#note-on-allofanyofoneof
    // we need to pick the appropriate type for the form, let's use the
    // schema to guide these choices.
    if (typeof oneOf !== 'undefined') {
      // credentials are either a string field or an opaque object, for
      // forms let's pick the string field and override it to a password
      // We are assuming that the schema is consistent here
      const [asString] = oneOf;
      return {
        ...asString,
        name,
        required: field.required,
        type: asString.format,
        isSecret: asString.format === 'password',
      };
    } else {
      return {
        name,
        ...field,
        ...(typeof newEnumValues !== undefined && { enum: newEnumValues }),
      };
    }
  }
}
