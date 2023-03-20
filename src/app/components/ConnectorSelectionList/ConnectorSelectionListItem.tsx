import React, { FC, useState } from 'react';

import {
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Popover,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Stack,
  StackItem,
  DataListControl,
  DataListAction,
  Truncate,
} from '@patternfly/react-core';
import {
  DataSinkIcon,
  DataSourceIcon,
  OutlinedStarIcon,
} from '@patternfly/react-icons';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { global_Color_200 } from '@patternfly/react-tokens';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorSelectionListItem.css';

export type ConnectorSelectionListItemProps = {
  id: string;
  labels: string[];
  title: string;
  version: string;
  description: string;
  pricingTier: string;
  style: any;
};

export const ConnectorSelectionListItem: FC<
  ConnectorSelectionListItemProps
> = ({ id, labels = [], title, version, description, style }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const displayLabels = labels
    .filter(
      (label) =>
        label !== 'source' &&
        label !== 'sink' &&
        label !== 'category-featured' &&
        label.startsWith('category-')
    )
    .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
    .map((label) => <Label key={label}>{t(label)}</Label>);
  return (
    <DataListItem aria-labelledby={id} id={id} style={{ ...style }}>
      <DataListItemRow>
        <DataListControl>
          {labels.includes('source') ? (
            <DataSourceIcon size={'md'} color={global_Color_200.value} />
          ) : (
            <DataSinkIcon size={'md'} color={global_Color_200.value} />
          )}
        </DataListControl>
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
                    <FlexItem onClick={(_) => setIsOpen(!isOpen)}>
                      <Popover
                        position="right"
                        aria-label={t('ConnectorHelpAndGuidances')}
                        bodyContent={description}
                        isVisible={isOpen}
                        shouldClose={() => setIsOpen(false)}
                      >
                        <OutlinedQuestionCircleIcon
                          className="connector-selection-list-item__help-icon"
                          color={global_Color_200.value}
                        />
                      </Popover>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <LabelGroup numLabels={labels.length + 1}>
                    {labels.includes('source') ? (
                      <Label key="source" color="blue">
                        Source
                      </Label>
                    ) : (
                      <Label key="sink" color="green">
                        Sink
                      </Label>
                    )}
                    {labels.includes('category-featured') ? (
                      <Label key={'category-featured'}>
                        <OutlinedStarIcon />
                        &nbsp;{t('category-featured')}
                      </Label>
                    ) : undefined}
                    {displayLabels}
                  </LabelGroup>
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
        <DataListAction
          className={'connector-selection-list-item__version-and-tier-cell'}
          id={''}
          aria-labelledby={''}
          aria-label={''}
        >
          <Stack hasGutter>
            <StackItem key={'version'}>
              <DescriptionList isHorizontal isFluid>
                <DescriptionListGroup
                  className={'connector-selection-list-item__version'}
                >
                  <DescriptionListTerm>{t('version')}:</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Truncate content={version} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </StackItem>
            {/*
            
            <StackItem key={'tier'}>
              <LabelGroup>
                {pricingTier !== '' && <Label>{t(pricingTier)}</Label>}
              </LabelGroup>
            </StackItem>
          */}
          </Stack>
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};
