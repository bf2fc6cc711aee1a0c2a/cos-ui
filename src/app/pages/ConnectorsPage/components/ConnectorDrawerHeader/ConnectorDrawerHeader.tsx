import React, { FunctionComponent } from 'react';

import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';

import './ConnectorDrawerHeader.css';

export type DrawerHeaderProps = {
  drawerHeading: string;
  status?: React.ReactNode;
  actionsMenu?: React.ReactNode;
  onClose: () => void;
};
export const ConnectorDrawerHeader: FunctionComponent<DrawerHeaderProps> = ({
  drawerHeading,
  status,
  actionsMenu,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <DrawerHead>
      <TextContent>
        <Text
          component={TextVariants.small}
          className="connector-drawer__header-text"
        >
          {t('connectorName')}
        </Text>
        <Flex>
          <FlexItem>
            <Title
              headingLevel={'h2'}
              size={TitleSizes['xl']}
              className="connector-drawer__header-title"
            >
              {drawerHeading}
            </Title>
          </FlexItem>
          {status && (
            <FlexItem spacer={{ default: 'spacerSm' }}>{status}</FlexItem>
          )}
        </Flex>
      </TextContent>

      <DrawerActions>
        {actionsMenu}
        <DrawerCloseButton onClick={onClose} />
      </DrawerActions>
    </DrawerHead>
  );
};
