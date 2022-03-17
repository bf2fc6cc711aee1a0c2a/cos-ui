import React from 'react';
import { Translation } from 'react-i18next';
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
    <Translation>
      {(t) => (
        <Popover bodyContent={content}>
          <button
            type="button"
            aria-label={t('More info for {{name}}', { name })}
            onClick={(e) => e.preventDefault()}
            aria-describedby="form-group-label-info"
            className="pf-c-form__group-label-help"
          >
            <HelpIcon noVerticalAlign />
          </button>
        </Popover>
      )}
    </Translation>
  ) : undefined;

/**
 * CustomJsonSchemaBridge generates the appropriate attributes for uniforms-patternfly
 * based on the incoming model data
 */
export class CustomJsonSchemaBridge extends JSONSchemaBridge {
  constructor(schema: any, validator: any) {
    super(schema, validator);
  }

  getField(name: string): Record<string, any> {
    const field = super.getField(name);
    const { description, example, title, ...props } = field;
    return {
      helperText: getExampleText(example),
      labelIcon: getLabelIcon(title, description),
      title,
      ...props,
    };
  }
}
