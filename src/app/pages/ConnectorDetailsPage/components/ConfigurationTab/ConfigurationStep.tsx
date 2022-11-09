import { JsonSchemaConfigurator } from '@app/components/JsonSchemaConfigurator/JsonSchemaConfigurator';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import {
  applyClientSideFormCustomizations,
  clearEmptyObjectValues,
  patchConfigurationObject,
} from '@utils/shared';
import _ from 'lodash';
import React from 'react';
import { FC } from 'react';

import {
  Form,
  FormGroup,
  Popover,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './ConfigurationStep.css';

export type ConfigurationStepProps = {
  editMode: boolean;
  schema: Record<string, any>;
  configuration: unknown;
  changeIsValid: (isValid: boolean) => void;
  onUpdateConfiguration: (type: string, update: any) => void;
};
export const ConfigurationStep: FC<ConfigurationStepProps> = ({
  editMode,
  schema,
  configuration,
  changeIsValid,
  onUpdateConfiguration,
}) => {
  const { t } = useTranslation();

  const formConfiguration = patchConfigurationObject(
    schema,
    clearEmptyObjectValues(JSON.parse(JSON.stringify(configuration)))
  );

  const onChange = (config: unknown, isValid: boolean) => {
    onUpdateConfiguration('connector', config);
    changeIsValid(isValid);
  };

  const getFieldViewComponent = (
    propertyKey: string,
    propertyDefinition: {
      title?: string;
      type?: string;
      oneOf?: Array<{ format: string }>;
    },
    value: any
  ): React.ReactNode => {
    const { title, type, oneOf } = propertyDefinition;
    // a good place to start troubleshooting problems in the detail view
    /*
    console.log(
      'getViewComponent, propertyName: ',
      propertyName,
      ' propertyDefinition: ',
      propertyDefinition,
      ' value: ',
      value
    );
    */
    const propertyNameFallback = _.capitalize(propertyKey.replace('_', ' '));
    const noPropertySet = (name: string) => (
      <Text className={'connector-detail__field_view_no_value'}>
        {t('propertyNotConfigured', { name })}
      </Text>
    );
    // Use the schema to determine the best way to
    // represent the data
    switch (type) {
      case 'object':
        if (propertyKey === 'data_shape') {
          return <DataShape data={value} />;
        }
        if (value) {
          return (
            <Text component={TextVariants.pre}>{JSON.stringify(value)}</Text>
          );
        }
        return noPropertySet(title || propertyNameFallback);
      case 'boolean':
        if (typeof value !== 'undefined') {
          return <Text>{JSON.stringify(value)}</Text>;
        }
        return noPropertySet(title || propertyNameFallback);
      default:
        if (typeof oneOf !== 'undefined') {
          // we are assuming the schema is consistent here
          const [def] = oneOf;
          if (def.format === 'password') {
            return <Text>**************************</Text>;
          }
        }
        if (typeof value !== 'undefined') {
          return <Text>{value}</Text>;
        }
        return noPropertySet(title || propertyNameFallback);
    }
  };

  return (
    <StepBodyLayout
      title={t('connectorSpecific')}
      description={t('configurationStepDescription')}
    >
      {editMode ? (
        <JsonSchemaConfigurator
          schema={schema}
          configuration={formConfiguration}
          onChange={onChange}
          editMode={true}
        />
      ) : (
        <Form>
          {Object.entries(applyClientSideFormCustomizations(schema.properties))
            .filter(([key, value]: [string, any]) => {
              if (['object', 'array'].includes(value.type)) {
                if (key === 'data_shape' && formConfiguration[key]) {
                  return true;
                }
                return false;
              }
              return true;
            })
            .map(([key, value]: [string, any]) => (
              <FormGroup
                key={key}
                label={value.title || _.capitalize(key.replace('_', ' '))}
                fieldId={key}
                isRequired={schema.required.includes(key)}
                labelIcon={
                  <Popover
                    bodyContent={
                      <p>
                        {value.description
                          ? value.description
                          : _.capitalize(key.replace('_', ' '))}
                      </p>
                    }
                  >
                    <button
                      type="button"
                      aria-label="More info for name field"
                      onClick={(e) => e.preventDefault()}
                      aria-describedby="simple-form-name-01"
                      className="pf-c-form__group-label-help"
                    >
                      <HelpIcon noVerticalAlign />
                    </button>
                  </Popover>
                }
              >
                {getFieldViewComponent(
                  key,
                  schema.properties[key],
                  formConfiguration[key]
                )}
              </FormGroup>
            ))}
        </Form>
      )}
    </StepBodyLayout>
  );
};
type DataShape = {
  data: any;
};
export const DataShape: FC<DataShape> = ({ data }) => {
  return (
    <>
      {Object.keys(data).map((key) => {
        return (
          <FormGroup key={key} label={_.upperFirst(key)} fieldId={key}>
            <Text component={TextVariants.p}>{data[key].format}</Text>
          </FormGroup>
        );
      })}
    </>
  );
};
