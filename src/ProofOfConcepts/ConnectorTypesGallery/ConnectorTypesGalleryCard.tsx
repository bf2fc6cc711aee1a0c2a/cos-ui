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
  Truncate,
  Popover,
  CardBody,
} from '@patternfly/react-core';
import {
  BuildIcon,
  BuilderImageIcon,
  OutlinedQuestionCircleIcon,
  OutlinedStarIcon,
} from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

import { useConnectorTypesGalleryCache } from './ConnectorTypesGalleryCache';

export type ConnectorTypesGalleryCardProps = {
  id: string;
  labels: string[];
  featuredRank: number;
  name: string;
  description: string;
  version: string;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
};

export const ConnectorTypesGalleryCard: FunctionComponent<ConnectorTypesGalleryCardProps> =
  ({
    id,
    labels = [],
    featuredRank,
    name,
    description,
    version,
    selectedId,
    onSelect,
  }) => {
    const { t } = useTranslation();
    const { useMasonry } = useConnectorTypesGalleryCache();
    return (
      <Card
        key={id}
        isCompact={true}
        isSelectable
        isSelected={selectedId === id}
        onClick={() => onSelect(id)}
        style={useMasonry ? { height: 250, width: 300 } : {}}
      >
        <CardHeader>
          {labels.includes('source') ? (
            <>
              <BuildIcon color="lightGrey" size="lg" />
              <CardActions>
                <Label color="blue">{t('Source')}</Label>
              </CardActions>
            </>
          ) : (
            <>
              <BuilderImageIcon color="lightGrey" size="lg" />
              <CardActions>
                <Label color="green">{t('Sink')}</Label>
              </CardActions>
            </>
          )}
        </CardHeader>
        <CardTitle>
          {name}&nbsp;&nbsp;
          <Popover
            position="right"
            aria-label={t('ConnectorHelpAndGuidances')}
            headerContent={t('ConnectorHelpAndGuidances')}
            bodyContent={description}
          >
            <OutlinedQuestionCircleIcon color="grey" />
          </Popover>
          <DescriptionList isHorizontal isFluid>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('version')}:</DescriptionListTerm>
              <DescriptionListDescription title={version}>
                <Truncate position="start" content={version} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardTitle>
        <CardBody />
        <CardFooter>
          <LabelGroup isCompact>
            {featuredRank > 0 ? (
              <Label key="featured" isCompact isTruncated>
                <OutlinedStarIcon />
                &nbsp;{t('Featured')}
              </Label>
            ) : (
              <></>
            )}
            {labels
              .filter((label) => label !== 'source' && label !== 'sink')
              .sort((a, b) =>
                a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
              )
              .map((label) => (
                <Label key={label} isCompact isTruncated variant={'outline'}>
                  {t(label)}
                </Label>
              ))}
          </LabelGroup>
        </CardFooter>
      </Card>
    );
  };
