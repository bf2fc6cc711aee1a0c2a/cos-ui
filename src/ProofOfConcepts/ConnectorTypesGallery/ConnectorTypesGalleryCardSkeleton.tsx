import React from 'react';
import { FunctionComponent } from 'react';

import {
  Card,
  CardHeader,
  CardActions,
  Label,
  CardTitle,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  CardFooter,
  LabelGroup,
  CardBody,
  Skeleton,
} from '@patternfly/react-core';

export type ConnectorTypesGalleryCardSkeletonProps = {};

export const ConnectorTypesGalleryCardSkeleton: FunctionComponent<ConnectorTypesGalleryCardSkeletonProps> =
  ({}) => {
    return (
      <Card isCompact={true} isSelectable style={{ height: 170, margin: 5 }}>
        <CardHeader>
          <>
            <Skeleton shape={'circle'} width={'1.4em'} />
            <CardActions>
              <Skeleton height={'0.8em'} width={'4em'} />
            </CardActions>
          </>
        </CardHeader>
        <CardTitle>
          <Skeleton style={{ margin: 3 }} width={'10em'} />
          <DescriptionList isHorizontal isFluid>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <Skeleton
                  style={{ margin: 3 }}
                  height={'0.8em'}
                  width={'5em'}
                />
              </DescriptionListTerm>
              <DescriptionListDescription>
                <Skeleton
                  style={{ margin: 3 }}
                  height={'0.8em'}
                  width={'7em'}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardTitle>
        <CardBody />
        <CardFooter>
          <LabelGroup isCompact>
            <Label key={0} isCompact isTruncated variant={'outline'}>
              <Skeleton style={{ margin: 3 }} height={'0.8em'} width={'4em'} />
            </Label>
            <Label key={1} isCompact isTruncated variant={'outline'}>
              <Skeleton style={{ margin: 3 }} height={'0.8em'} width={'4em'} />
            </Label>
            <Label key={2} isCompact isTruncated variant={'outline'}>
              <Skeleton style={{ margin: 3 }} height={'0.8em'} width={'4em'} />
            </Label>
          </LabelGroup>
        </CardFooter>
      </Card>
    );
  };
