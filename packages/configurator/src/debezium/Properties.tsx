import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IPropertiesProps {
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
}

export const Properties: React.FC<IPropertiesProps> = (props) => {

  const [urlValue, setUrlValue] = React.useState('');
  const handleUrlChange = (value: React.SetStateAction<string>) => {
    // TODO: update the configuration
    setUrlValue(value);
    props.onChange(undefined, value !== '');
  };

  return (
    <div>
      <Title headingLevel="h2">Properties</Title>
      {/* TODO: The properties to display are determined from the supplied configuration */}
      <Form>
        <FormGroup label="URL" isRequired fieldId="properties-url">
          <TextInput
            isRequired
            type="text"
            id="properties-url"
            name="properties-url"
            value={urlValue}
            onChange={handleUrlChange}
          />
        </FormGroup>
      </Form>
    </div>
  );
}