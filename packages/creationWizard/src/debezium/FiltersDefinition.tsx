import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IFilterDefinitionProps {
  configuration: Map<string,unknown>;
  onChange: (configuration: Map<string,unknown>, isValid: boolean) => void;
}

export const FilterDefinition: React.FC<IFilterDefinitionProps> = props => {
  const [filterValue, setFilterValue] = React.useState<string>('');
  const handleFilterChange = (value: React.SetStateAction<string>, event: React.FormEvent<HTMLInputElement>) => {
    // TODO: update the configuration
    setFilterValue(value);
    setConfiguratorValue(props.configuration, event.currentTarget.name, value);
  };

  const setConfiguratorValue = (
    config: Map<string,unknown>,
    key: string,
    value: React.SetStateAction<string>
  ) => {
    const configCopy = config
      ? new Map<string,unknown>(config)
      : new Map<string,unknown>();
    configCopy.set(key, value);
    props.onChange(configCopy, value !== '');
  };

  React.useEffect(() => {
    // TODO: Keys will be extracted from the configuration (properties needed on this step)
    if (props.configuration && props.configuration.has('filter-prop')) {
      setFilterValue(props.configuration.get('filter-prop') as string);
    }
    props.onChange(props.configuration, true);
  }, []);

  return (
    <div>
      <Title headingLevel="h2">Filter Definition</Title>
      {/* TODO: The properties to display are determined from the supplied configuration */}
      <Form>
        <FormGroup label="Filter Property" fieldId="filter-prop">
          <TextInput
            type="text"
            id="filter-prop"
            name="filter-prop"
            value={filterValue}
            onChange={handleFilterChange}
          />
        </FormGroup>
      </Form>
    </div>
  );
};
