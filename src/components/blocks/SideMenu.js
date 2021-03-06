import React, { useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ModalStateContext } from '../../contexts/ModalContext';
import { ShowMsTeamsStateContext, ShowMsTeamsDispatchContext } from '../../contexts/ShowMsTeamsContext';
import { ReactComponent as AccountsIcon } from '../../images/AccountsIcon.svg';
import { ReactComponent as ApplicationsIcon } from '../../images/ApplicationsIcon.svg';
import { ReactComponent as SipTrunksIcon } from '../../images/SipTrunksIcon.svg';
import { ReactComponent as PhoneNumbersIcon } from '../../images/PhoneNumbersIcon.svg';
import { ReactComponent as MsTeamsIcon } from '../../images/MsTeamsIcon.svg';
import { ReactComponent as SettingsIcon } from '../../images/SettingsIcon.svg';

const StyledSideMenu = styled.div`
  width: 15rem;
  flex-shrink: 0;
  height: calc(100vh - 4rem);
  overflow: auto;
  background: #FFF;
  padding-top: 3.25rem;
`;

const activeClassName = 'nav-item-active';

const StyledNavLink = styled(NavLink).attrs({ activeClassName })`
  height: 2.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: stretch;
  font-weight: 500;
  text-decoration: none;
  color: #565656;
  fill: #565656;

  &.${activeClassName} {
    box-shadow: inset 3px 0 0 0 #D91C5C;
    color: #D91C5C;
    fill: #D91C5C;
  }

  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 3px #D91C5C;
  }

  &:hover {
    background: RGBA(217, 28, 92, 0.1);
    color: #C0134D;
    fill: #C0134D;
  }
  &.${activeClassName}:hover {
    color: #D91C5C;
    fill: #D91C5C;
  }
`;

const IconContainer = styled.span`
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: 0;
`;

const MenuText = styled.span`
  display: flex;
  flex-grow: 1;
  align-items: center;
  outline: 0;
`;

const MenuLink = props => {
  const modalOpen = useContext(ModalStateContext);
  return (
    <StyledNavLink
      to={props.to}
      activeClassName={activeClassName}
      tabIndex={modalOpen ? '-1' : ''}
    >
      <IconContainer tabIndex="-1">
        {props.icon}
      </IconContainer>
      <MenuText tabIndex="-1">
        {props.name}
      </MenuText>
    </StyledNavLink>
  );
};

const SideMenu = () => {
  const showMsTeams = useContext(ShowMsTeamsStateContext);
  const getMsTeamsData = useContext(ShowMsTeamsDispatchContext);
  useEffect(() => {
    getMsTeamsData();
    // eslint-disable-next-line
  }, []);
  return (
    <StyledSideMenu>
      <MenuLink to="/internal/accounts"      name="Accounts"      icon={<AccountsIcon     />} />
      <MenuLink to="/internal/applications"  name="Applications"  icon={<ApplicationsIcon />} />
      <MenuLink to="/internal/sip-trunks"    name="SIP Trunks"    icon={<SipTrunksIcon    />} />
      <MenuLink to="/internal/phone-numbers" name="Phone Numbers" icon={<PhoneNumbersIcon />} />
      {showMsTeams && (
        <MenuLink to="/internal/ms-teams-tenants" name="MS Teams Tenants" icon={<MsTeamsIcon />} />
      )}
      <MenuLink to="/internal/settings" name="Settings" icon={<SettingsIcon />} />
    </StyledSideMenu>
  );
};

export default SideMenu;
