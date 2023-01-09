import React, { FC, useCallback, useState } from 'react';
import { useDimensionsEffect } from 'react-viewport-utils';

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
};
export const ConnectorSelectionListFilterPanel: FC<
  ConnectorSelectionListFilterPanelProps
> = ({
  id,
  currentCategory,
  labels,
  selectedCategories = [],
  onChangeLabelFilter,
  selectedPricingTier,
  onChangePricingTierFilter,
}) => {
  const { t } = useTranslation();
  const loading = typeof labels === 'undefined';
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const typeLabels: Array<string> = selectedCategories.filter(
    (category) => category !== currentCategory
  );
  const isSinkChecked = typeLabels.find((cat) => cat === 'sink') !== undefined;
  const isSourceChecked =
    typeLabels.find((cat) => cat === 'source') !== undefined;
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
    const top = scrollableElement!.offsetTop + 20;
    scrollableElement!.style.height = `${dimensions.height - top}px`;
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
            <FilterSidePanelCategory
              key={'subscription-tier'}
              title={
                <>
                  {t('Tier')}&nbsp;&nbsp;
                  <Popover
                    position="right"
                    bodyContent={
                      <TextContent>
                        <Text component={TextVariants.h5}>{t('TODO')}</Text>
                        <Text component={TextVariants.h6}>{t('TODO')}</Text>
                        <Text component={TextVariants.p}>{t('TODO')}</Text>
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
                onClick={() => onChangeLabelFilter(typeLabels)}
                title={t('All Items')}
              />
              {labels!
                .slice(0, isExpanded ? labels.length : 10)
                .map(({ label, count }) => (
                  <VerticalTabsTab
                    key={label}
                    active={
                      selectedCategories.find((cat) => cat === label) !==
                      undefined
                    }
                    onClick={() => onChangeLabelFilter([label, ...typeLabels])}
                    title={`${t(label)} (${count})`}
                  />
                ))}
              {isExpanded && (
                <VerticalTabsTab
                  className={
                    'connector-selection-list__side-panel-expander-text'
                  }
                  key={'show-less'}
                  onClick={() => setIsExpanded(false)}
                  title={t('Show less')}
                />
              )}
              {!isExpanded && (
                <VerticalTabsTab
                  className={
                    'connector-selection-list__side-panel-expander-text'
                  }
                  key={'show-more'}
                  onClick={() => setIsExpanded(true)}
                  title={t('Show more')}
                />
              )}
            </VerticalTabs>
          ) : (
            <Loading />
          )}
        </FilterSidePanelCategory>
      </div>
    </FilterSidePanel>
  );
};
