import React, { FC, useState } from 'react';
import { connectField, filterDOMProps } from 'uniforms';

import {
  FormGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core';

export type TypeaheadProps = {
  allowedValues: string[];
  id: string;
  disabled: boolean;
  error: boolean;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  [key: string]: any;
};
function Typeahead({
  id,
  label,
  type,
  disabled,
  error,
  errorMessage,
  showInlineError,
  help,
  required,
  ...props
}: TypeaheadProps) {
  return (
    <FormGroup
      fieldId={id}
      label={label}
      isRequired={required}
      validated={error ? 'error' : 'default'}
      type={type}
      helperText={help}
      helperTextInvalid={errorMessage}
      {...filterDOMProps(props)}
    >
      <TypeaheadControl {...{ id, disabled, error, ...props }} />
    </FormGroup>
  );
}
type TypeaheadFieldProps = {
  allowedValues: string[];
  id: string;
  disabled: boolean;
  error: boolean;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  [key: string]: any;
};
const TypeaheadControl: FC<TypeaheadFieldProps> = ({
  allowedValues = [],
  id,
  disabled,
  error,
  name,
  placeholder,
  value,
  onChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Select
      {...filterDOMProps(props)}
      className={'typeahead-control__select'}
      ouiaId={name}
      name={name}
      isCreatable={false}
      isDisabled={disabled}
      variant={SelectVariant.typeahead}
      onToggle={() => setIsOpen(!isOpen)}
      isOpen={isOpen}
      shouldResetOnSelect
      placeholderText={placeholder}
      selections={value}
      maxHeight={400}
      onSelect={(_, value) => {
        const newValue =
          typeof value === 'object'
            ? (value as SelectOptionObject).toString()
            : (value as string);
        setIsOpen(false);
        onChange(newValue);
      }}
      validated={error ? 'error' : 'default'}
      inputIdPrefix={name}
    >
      {allowedValues
        .filter((value) => value !== '')
        .map((value) => (
          <SelectOption key={value} value={value} />
        ))}
    </Select>
  );
};

export const TypeaheadField = connectField<TypeaheadFieldProps>(Typeahead);
