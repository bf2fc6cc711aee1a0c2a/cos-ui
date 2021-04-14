import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IRuntimeOptionsProps {
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
}

export const RuntimeOptions: React.FC<IRuntimeOptionsProps> = (props) => {

  const [runtimePropValue, setRuntimePropValue] = React.useState('');
  const handleRuntimePropChange = (value: React.SetStateAction<string>) => {
    // TODO: update the configuration, provide config pairs back to the configurator
    setRuntimePropValue(value);
    props.onChange({foo: "bar"}, true);
  };

  React.useEffect(() => {
    props.onChange(undefined, true);
  }, []);

  return (
    <div>
      <Title headingLevel="h2">Runtime Options</Title>
      {/* TODO: The properties to display are determined from the supplied configuration */}
      <Form>
        <FormGroup label="Runtime Property" fieldId="runtime-prop">
          <TextInput
            type="text"
            id="runtime-prop"
            name="runtime-prop"
            value={runtimePropValue}
            onChange={handleRuntimePropChange}
          />
        </FormGroup>
      </Form>
    </div>
  );
}