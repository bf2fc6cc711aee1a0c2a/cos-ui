import React, { FunctionComponent } from 'react';
import {
  Button,
  ButtonVariant,
  InputGroup,
  PageSection,
  TextContent,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Switch, Route, NavLink, useHistory } from 'react-router-dom';
import { Connectors } from './Connectors';
import { ConnectedCreationWizard } from './ConnectedCreationWizard';
import { useTranslation } from 'react-i18next';

export const AppRoutes: FunctionComponent = () => {
  const history = useHistory();
  const { t } = useTranslation();

  const goToConnectorsList = () => history.push('/');
  return (
    <Switch>
      <Route path={'/'} exact>
        <PageSection variant={'light'}>
          <TextContent>
            <Title headingLevel="h1">{t('managedConnectors')}</Title>
          </TextContent>
        </PageSection>
        <PageSection variant={'light'} padding={{ default: 'noPadding' }}>
          <Toolbar id="toolbar">
            <ToolbarContent>
              <ToolbarItem>
                <InputGroup>
                  <TextInput
                    name="textInput1"
                    id="textInput1"
                    type="search"
                    aria-label="search input example"
                  />
                  <Button
                    variant={ButtonVariant.control}
                    aria-label="search button for search input"
                  >
                    <SearchIcon />
                  </Button>
                </InputGroup>
              </ToolbarItem>
              <ToolbarItem>
                <NavLink
                  className="pf-c-button pf-m-primary"
                  to={'/create-connector'}
                >
                  {t('createConnectors')}
                </NavLink>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Connectors />
        </PageSection>
      </Route>
      <Route path={'/create-connector'}>
        <PageSection padding={{ default: 'noPadding' }}>
          <ConnectedCreationWizard
            onClose={goToConnectorsList}
            onSave={goToConnectorsList}
          />
        </PageSection>
      </Route>
    </Switch>
  );
};
