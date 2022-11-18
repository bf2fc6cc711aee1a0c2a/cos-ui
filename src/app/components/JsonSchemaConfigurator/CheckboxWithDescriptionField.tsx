import React from 'react';
import { connectField, filterDOMProps } from 'uniforms';

import { Checkbox } from '@patternfly/react-core';

export type CheckboxWithDescriptionProps = {
  id: string;
  disabled: boolean;
  error: boolean;
  name: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  [key: string]: any;
};
function CheckboxWithDescription({
  id,
  label,
  type,
  disabled,
  error,
  errorMessage,
  showInlineError,
  help,
  description,
  value,
  onChange,
  required,
  ...props
}: CheckboxWithDescriptionProps) {
  return (
    <Checkbox
      id={id}
      isChecked={value}
      label={label}
      onChange={() => onChange(!value)}
      description={description}
      {...filterDOMProps(props)}
    />
  );
}

export const CheckboxWithDescriptionField = connectField(
  CheckboxWithDescription
);
