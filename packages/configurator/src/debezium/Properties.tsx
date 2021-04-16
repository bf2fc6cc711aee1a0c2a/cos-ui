import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IPropertiesProps {
  configuration: Map<string, unknown>;
  onChange: (configuration: Map<string, unknown>, isValid: boolean) => void;
}

export const Properties: React.FC<IPropertiesProps> = props => {
  const [urlValue, setUrlValue] = React.useState<string>('');
  const handleUrlChange = (
    value: React.SetStateAction<string>,
    event: React.FormEvent<HTMLInputElement>
  ) => {
    // TODO: update the configuration
    setUrlValue(value);
    setConfiguratorValue(props.configuration, event.currentTarget.name, value);
  };

  const setConfiguratorValue = (
    config: Map<string, unknown>,
    key: string,
    value: React.SetStateAction<string>
  ) => {
    const configCopy = config
      ? new Map<string, unknown>(config)
      : new Map<string, unknown>();
    configCopy.set(key, value);
    props.onChange(configCopy, value !== '');
  };

  React.useEffect(() => {
    // TODO: Keys will be extracted from the configuration (properties needed on this step)
    if (props.configuration && props.configuration.has('properties-url')) {
      setUrlValue(props.configuration.get('properties-url') as string);
      props.onChange(props.configuration, true);
    }
  }, []);

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
};
