import React, { FC, useCallback } from 'react';
import { Dimensions, useDimensionsEffect } from 'react-viewport-utils';

import {
  FilterSidePanel,
  FilterSidePanelCategory,
  FilterSidePanelCategoryItem,
  VerticalTabs,
  VerticalTabsTab,
} from '@patternfly/react-catalog-view-extension';
import {
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import { Loading, useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorSelectionListFilterPanel.css';
import { ConnectorTypeLabelCount } from './typeExtensions';

export type ConnectorSelectionListFilterPanelProps = {
  labels?: Array<ConnectorTypeLabelCount>;
  id: string;
  currentCategory: string;
  selectedCategories: Array<string>;
  onChangeLabelFilter: (value: Array<string>) => void;
  selectedPricingTier: string;
  onChangePricingTierFilter: (value: string) => void;
  onAdjustViewportHeight: (
    dimensions: Dimensions,
    viewportEl: HTMLElement
  ) => void;
};
export const ConnectorSelectionListFilterPanel: FC<
  ConnectorSelectionListFilterPanelProps
> = ({
  id,
  currentCategory,
  labels,
  selectedCategories = [],
  onChangeLabelFilter,
  onAdjustViewportHeight,
}) => {
  const { t } = useTranslation();
  const loading = typeof labels === 'undefined';
  const selectedTypeLabels: Array<string> = selectedCategories.filter(
    (category) => !category.startsWith('category-')
  );
  const categoryLabels =
    typeof labels !== 'undefined'
      ? labels
          .filter(({ label }) => label.startsWith('category-'))
          .sort(({ label }) => (label === 'category-featured' ? -1 : 0))
      : [];

  const isSinkChecked =
    selectedTypeLabels.find((cat) => cat === 'sink') !== undefined;
  const isSourceChecked =
    selectedTypeLabels.find((cat) => cat === 'source') !== undefined;
  const handleSourceChecked = useCallback(() => {
    isSourceChecked
      ? onChangeLabelFilter([
          ...selectedCategories.filter((label) => label !== 'source'),
        ])
      : onChangeLabelFilter([
          ...selectedCategories.filter((label) => label !== 'sink'),
          'source',
        ]);
  }, [isSourceChecked, onChangeLabelFilter, selectedCategories]);
  const handleSinkChecked = useCallback(() => {
    isSinkChecked
      ? onChangeLabelFilter([
          ...selectedCategories.filter((label) => label !== 'sink'),
        ])
      : onChangeLabelFilter([
          ...selectedCategories.filter((label) => label !== 'source'),
          'sink',
        ]);
  }, [isSinkChecked, onChangeLabelFilter, selectedCategories]);
  useDimensionsEffect((dimensions) => {
    const scrollableElement = document.getElementById(id);
    if (scrollableElement) {
      onAdjustViewportHeight(dimensions, scrollableElement!);
    }
  });
  return (
    <FilterSidePanel className={'connector-selection-list__side-panel-main'}>
      <div id={id} className={'connector-selection-list__side-panel-viewport'}>
        {!loading && (
          <>
            <FilterSidePanelCategory
              key={'type-category'}
              title={
                <>
                  {t('Type')}&nbsp;&nbsp;
                  <Popover
                    position="right"
                    bodyContent={
                      <TextContent>
                        <Text component={TextVariants.h5}>{t('Type')}</Text>
                        <Text component={TextVariants.h6}>
                          {t('Source connector')}
                        </Text>
                        <Text component={TextVariants.p}>
                          {t('shortDescriptionSource')}
                        </Text>
                        <Text component={TextVariants.h6}>Sink connector</Text>
                        <Text component={TextVariants.p}>
                          {t('shortDescriptionSink')}
                        </Text>
                      </TextContent>
                    }
                  >
                    <OutlinedQuestionCircleIcon color="grey" />
                  </Popover>
                </>
              }
            >
              <FilterSidePanelCategoryItem
                key="source"
                checked={isSourceChecked}
                onClick={handleSourceChecked}
              >
                {t('Source')}
              </FilterSidePanelCategoryItem>
              <FilterSidePanelCategoryItem
                key="sink"
                checked={isSinkChecked}
                onClick={handleSinkChecked}
              >
                {t('Sink')}
              </FilterSidePanelCategoryItem>
            </FilterSidePanelCategory>
            {/*
            <FilterSidePanelCategory
              key={'subscription-tier'}
              title={
                <>
                  {t('Tier')}&nbsp;&nbsp;
                  <Popover
                    position="right"
                    bodyContent={
                      <TextContent>
                        <Text component={TextVariants.p}>
                          <Trans i18nKey={'tierPopoverHelpDescription'}>
                            Your subscription determines which tiers are
                            available for production. Tiers not available in
                            your subscription can also be created as a trial.{' '}
                            <Button
                              component={'a'}
                              variant={ButtonVariant.link}
                              isInline
                              icon={<ExternalLinkAltIcon />}
                              iconPosition="right"
                              href={t('tierPopoverHelpDescriptionLink')}
                              target={'_blank'}
                            >
                              Talk to a Red Hatter
                            </Button>{' '}
                            to learn about the subscription options available
                            for using this service in production.
                          </Trans>
                        </Text>
                      </TextContent>
                    }
                  >
                    <OutlinedQuestionCircleIcon color="grey" />
                  </Popover>
                </>
              }
            >
              {['free', 'essentials', 'plus'].map((tier) => (
                <FilterSidePanelCategoryItem
                  key={tier}
                  checked={selectedPricingTier === tier}
                  onClick={() =>
                    selectedPricingTier === tier
                      ? onChangePricingTierFilter('')
                      : onChangePricingTierFilter(tier)
                  }
                >
                  {t(tier)}
                </FilterSidePanelCategoryItem>
              ))}
            </FilterSidePanelCategory>
            */}
          </>
        )}
        <FilterSidePanelCategory key={'category-nav'}>
          {!loading ? (
            <VerticalTabs
              className={'connector-selection-list__side-panel-vertical-tabs'}
            >
              <VerticalTabsTab
                key="all"
                active={currentCategory === 'All Items'}
                onClick={() => onChangeLabelFilter(selectedTypeLabels)}
                title={t('All Items')}
              />
              {categoryLabels!.map(({ label }) => (
                <VerticalTabsTab
                  key={label}
                  active={
                    selectedCategories.find((cat) => cat === label) !==
                    undefined
                  }
                  onClick={() =>
                    onChangeLabelFilter([label, ...selectedTypeLabels])
                  }
                  title={t(label)}
                />
              ))}
            </VerticalTabs>
          ) : (
            <Loading />
          )}
        </FilterSidePanelCategory>
      </div>
    </FilterSidePanel>
  );
};
