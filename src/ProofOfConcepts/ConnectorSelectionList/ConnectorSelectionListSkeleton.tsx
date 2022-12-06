import React from 'react';
import { FunctionComponent } from 'react';

import {
  LabelGroup,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Flex,
  FlexItem,
  Popover,
  Skeleton,
  Label,
} from '@patternfly/react-core';

export type ConnectorSelectionListSkeletonProps = {};

export const ConnectorSelectionListSkeleton: FunctionComponent<ConnectorSelectionListSkeletonProps> =
  ({}) => {
    return (
      <DataList
        aria-label="selectable data list connector"
        style={{ height: 109 }}
      >
        <DataListItem>
          <DataListItemRow>
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <FlexItem>
                <Skeleton height={'2em'} width={'2em'} />
              </FlexItem>
              <FlexItem>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="primary content">
                      <Flex direction={{ default: 'column' }}>
                        <FlexItem>
                          <Flex>
                            <FlexItem>
                              <Skeleton style={{ margin: 3 }} width={'10em'} />
                            </FlexItem>
                            <FlexItem>
                              <Popover bodyContent>
                                <Skeleton shape={'circle'} width={'1.3em'} />
                              </Popover>
                            </FlexItem>
                            <FlexItem>
                              <Skeleton style={{ margin: 3 }} width={'10em'} />
                            </FlexItem>
                          </Flex>
                        </FlexItem>
                        <FlexItem>
                          <LabelGroup>
                            <Label key={0} isTruncated variant={'outline'}>
                              <Skeleton
                                style={{ margin: 3 }}
                                height={'0.8em'}
                                width={'2em'}
                              />
                            </Label>
                            <Label key={1} isTruncated variant={'outline'}>
                              <Skeleton
                                style={{ margin: 3 }}
                                height={'0.8em'}
                                width={'4em'}
                              />
                            </Label>
                            <Label key={2} isTruncated variant={'outline'}>
                              <Skeleton
                                style={{ margin: 3 }}
                                height={'0.8em'}
                                width={'3em'}
                              />
                            </Label>
                          </LabelGroup>
                        </FlexItem>
                      </Flex>
                    </DataListCell>,
                  ]}
                />
              </FlexItem>
            </Flex>
          </DataListItemRow>
        </DataListItem>
      </DataList>
    );
  };
