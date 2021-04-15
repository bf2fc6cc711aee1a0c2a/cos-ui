import React from 'react';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

export interface IFilterDefinitionProps {
  configuration: unknown;
  onChange: (configuration: unknown, isValid: boolean) => void;
}

export const FilterDefinition: React.FC<IFilterDefinitionProps> = props => {
  const [filterValue, setFilterValue] = React.useState('');
  const handleFilterChange = (value: React.SetStateAction<string>) => {
    // TODO: update the configuration
    setFilterValue(value);
    props.onChange(undefined, true);
  };

  React.useEffect(() => {
    props.onChange(undefined, true);
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
