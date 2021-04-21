import React, { FunctionComponent, ReactNode, useState } from 'react';
import {
  Nav,
  NavList,
  NavItem,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  PageHeaderTools,
} from '@patternfly/react-core';
import { NavLink, useHistory } from 'react-router-dom';
import logo from './Patternfly-Logo.svg';

interface IAppLayout {
  children: ReactNode;
}

export const AppLayout: FunctionComponent<IAppLayout> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);

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
            Managed Connectors
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
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to content</SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      role="main"
      header={Header}
      sidebar={Sidebar}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
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
