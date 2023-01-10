import React, { FC } from 'react';

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

export type ConnectorSelectionListSkeletonProps = {
  rowHeight: number;
  style: any;
};

export const ConnectorSelectionListSkeleton: FC<
  ConnectorSelectionListSkeletonProps
> = ({ style }) => {
  return (
    <DataList aria-label="selectable data list connector" style={{ ...style }}>
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
