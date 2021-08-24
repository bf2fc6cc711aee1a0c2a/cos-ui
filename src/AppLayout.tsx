import React, { FunctionComponent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useHistory } from 'react-router-dom';

import {
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';

import logo from './Patternfly-Logo.svg';

interface IAppLayout {
  children: ReactNode;
}

export const AppLayout: FunctionComponent<IAppLayout> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);

  const { t } = useTranslation();

  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const HeaderTools = <PageHeaderTools>{'email'}</PageHeaderTools>;

  const Header = (
    <PageHeader
      logo={<LogoImg />}
      showNavToggle
      isNavOpen={isNavOpen}
      headerTools={HeaderTools}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      aria-label={'global_navigation'}
    />
  );

  const Navigation = (
    <Nav
      id="nav-primary-simple"
      role="navigation"
      theme="dark"
      aria-label={'global'}
    >
      <NavList id="nav-list-simple">
        <NavItem id={'connectors'}>
          <NavLink to={'/'} activeClassName="pf-m-current">
            {t('managedConnectors')}
          </NavLink>
        </NavItem>
      </NavList>
    </Nav>
  );
  const Sidebar = (
    <PageSidebar
      theme="dark"
      nav={Navigation}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
    />
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      role="main"
      header={Header}
      sidebar={Sidebar}
      onPageResize={onPageResize}
    >
      {children}
    </Page>
  );
};

function LogoImg() {
  const history = useHistory();
  function handleClick() {
    history.push('/');
  }
  return <img src={logo} onClick={handleClick} alt="PatternFly Logo" />;
}
