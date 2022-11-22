import React from 'react';

import {
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type ConnectorTypesListItemProps = {
  id: string;
  labels: string[];
  title: string;
  verison: string;
};

export const ConnectorTypeListItem: React.FunctionComponent<ConnectorTypesListItemProps> =
  ({ id, labels = [], title, verison }) => {
    const [selectedDataListItemId, setSelectedDataListItemId] =
      React.useState('');

    const onSelectDataListItem = (id) => {
      setSelectedDataListItemId(id);
    };

    const handleInputChange = (
      id: string,
      _event: React.FormEvent<HTMLInputElement>
    ) => {
      setSelectedDataListItemId(id);
    };

    const { t } = useTranslation();

    return (
      <DataList
        aria-label="selectable data list connector"
        selectedDataListItemId={selectedDataListItemId}
        onSelectDataListItem={onSelectDataListItem}
        selectableRow={{ onChange: handleInputChange }}
      >
        <DataListItem aria-labelledby={id} id={id}>
          <DataListItemRow>
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <FlexItem>
                {labels.includes('source') ? (
                  <PlusCircleIcon size="md" color="blue" />
                ) : (
                  <PlusCircleIcon size="md" color="green" />
                )}
              </FlexItem>
              <FlexItem>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="primary content">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <Flex>
                            <FlexItem>
                              <strong
                                className="pf-u-font-weight-bold"
                                id="selectable-action-item1"
                              >
                                {title}
                              </strong>
                            </FlexItem>
                            <FlexItem>
                              <OutlinedQuestionCircleIcon
                                href="#filled"
                                color="grey"
                              />
                            </FlexItem>
                            <FlexItem>
                              <span className="pf-u-font-size-sm pf-u-color-400">
                                {verison}
                              </span>
                            </FlexItem>
                          </Flex>
                        </FlexItem>
                        <FlexItem>
                          <LabelGroup numLabels="10">
                            {labels.includes('source') ? (
                              <Label color="blue">Source</Label>
                            ) : (
                              <Label color="green">Sink</Label>
                            )}
                            {labels
                              .filter(
                                (label) =>
                                  label !== 'source' && label !== 'sink'
                              )
                              .sort((a, b) =>
                                a
                                  .toLocaleLowerCase()
                                  .localeCompare(b.toLocaleLowerCase())
                              )
                              .map((label) => (
                                <Label key={label}>{t(label)}</Label>
                              ))}
                          </LabelGroup>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </FlexItem>
            </Flex>
            <DataListAction
              aria-labelledby={id}
              id={id}
              aria-label="Actions"
              isPlainButtonAction
            ></DataListAction>
          </DataListItemRow>
        </DataListItem>
      </DataList>
    );
  };
