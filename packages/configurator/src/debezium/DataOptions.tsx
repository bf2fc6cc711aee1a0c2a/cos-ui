import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IDataOptionsProps {
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
}

export const DataOptions: React.FC<IDataOptionsProps> = props => {
  const [dataPropValue, setDataPropValue] = React.useState('');
  const handleDataPropertyChange = (value: React.SetStateAction<string>) => {
    // TODO: update the configuration
    setDataPropValue(value);
    props.onChange(undefined, true);
  };

  React.useEffect(() => {
    props.onChange(undefined, true);
  }, []);

  return (
    <div>
      <Title headingLevel="h2">Data Options</Title>
      {/* TODO: The properties to display are determined from the supplied configuration */}
      <Form>
        <FormGroup label="Data Property" fieldId="data-prop">
          <TextInput
            type="text"
            id="data-prop"
            name="data-prop"
            value={dataPropValue}
            onChange={handleDataPropertyChange}
          />
        </FormGroup>
      </Form>
    </div>
  );
};
