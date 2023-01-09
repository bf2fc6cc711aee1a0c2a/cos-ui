import React from 'react';

import {
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Popover,
} from '@patternfly/react-core';
import { OutlinedStarIcon } from '@patternfly/react-icons';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type ConnectorSelectionListItemProps = {
  id: string;
  labels: string[];
  title: string;
  version: string;
  description: string;
  pricingTier: string;
};

export const ConnectorSelectionListItem: React.FunctionComponent<
  ConnectorSelectionListItemProps
> = ({ id, labels = [], title, version, description, pricingTier }) => {
  const { t } = useTranslation();

  const displayLabels = labels
    .filter((label) => label !== 'source' && label !== 'sink')
    .sort((a, b) =>
      a === 'category-featured'
        ? 1
        : a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
    )
    .map((label) =>
      label === 'category-featured' ? (
        <Label key={label}>
          <OutlinedStarIcon />
          &nbsp;{t(label)}
        </Label>
      ) : (
        <Label key={label}>{t(label)}</Label>
      )
    );

  return (
    <DataList aria-label="selectable data list connector">
      <DataListItem aria-labelledby={id} id={id}>
        <DataListItemRow>
          <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
            <FlexItem>
              {labels.includes('source') ? (
                <i
                  style={{
                    fontSize: 'var(--pf-global--icon--FontSize--lg)',
                    color: 'var(--pf-global--Color--200)',
                  }}
                  className={'pf-icon pf-icon-data-source'}
                ></i>
              ) : (
                <i
                  style={{
                    fontSize: 'var(--pf-global--icon--FontSize--lg)',
                    color: 'var(--pf-global--Color--200)',
                  }}
                  className={'pf-icon pf-icon-data-sink'}
                ></i>
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
                            <Popover
                              position="right"
                              aria-label={t('ConnectorHelpAndGuidances')}
                              headerContent={t('ConnectorHelpAndGuidances')}
                              bodyContent={description}
                            >
                              <OutlinedQuestionCircleIcon color="grey" />
                            </Popover>
                          </FlexItem>
                          <FlexItem>
                            <span className="pf-u-font-size-sm pf-u-color-400">
                              {version}
                            </span>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <LabelGroup numLabels={labels.length + 1}>
                          {labels.includes('source') ? (
                            <Label color="blue">Source</Label>
                          ) : (
                            <Label color="green">Sink</Label>
                          )}
                          <Label>{t(pricingTier)}</Label>
                          {displayLabels}
                        </LabelGroup>
                      </FlexItem>
                    </Flex>
                  </DataListCell>,
                ]}
              />
            </FlexItem>
          </Flex>
          {/*         
            <DataListAction
              children
              aria-labelledby={id}
              id={id}
              aria-label="Actions"
              isPlainButtonAction
            ></DataListAction>
            */}
        </DataListItemRow>
      </DataListItem>
    </DataList>
  );
};
