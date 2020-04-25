import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { NotificationDispatchContext } from '../../../contexts/NotificationContext';
import InternalTemplate from '../../templates/InternalTemplate';
import TableContent from '../../blocks/TableContent.js';

const AccountsList = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  useEffect(() => {
    document.title = `Accounts | Jambonz | Open Source CPAAS`;
  });

  //=============================================================================
  // Get accounts
  //=============================================================================
  const getAccounts = async () => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }
      const results = await axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Accounts',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const simplifiedAccounts = results.data.map(a => ({
        sid:         a.account_sid,
        name:        a.name,
        sip_realm:   a.sip_realm,
        url:         a.registration_hook && a.registration_hook.url,
        method:      a.registration_hook && a.registration_hook.method,
        username:    a.registration_hook && a.registration_hook.username,
        password:    a.registration_hook && a.registration_hook.password,
      }));
      return(simplifiedAccounts);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        dispatch({
          type: 'ADD',
          level: 'error',
          message: (err.response && err.response.data && err.response.data.msg) || 'Unable to get account data',
        });
        console.log(err.response || err);
      }
    }
  };

  //=============================================================================
  // Delete account
  //=============================================================================
  const formatAccountToDelete = account => {
    const items = [
      { name: 'Name:'                  , content: account.name      || '[none]' },
      { name: 'SIP Realm:'             , content: account.sip_realm || '[none]' },
      { name: 'Registration Webhook:'  , content: account.url       || '[none]' },
    ];
    return items;
  };
  const deleteAccount = async accountToDelete => {
    try {
      if (!localStorage.getItem('token')) {
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'You must log in to view that page.',
        });
        return;
      }

      // Check if any application or phone number uses this account
      const applicationsPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/Applications',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const phoneNumbersPromise = axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: '/PhoneNumbers',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const promiseAllValues = await Promise.all([
        applicationsPromise,
        phoneNumbersPromise,
      ]);
      const applications = promiseAllValues[0].data;
      const phoneNumbers = promiseAllValues[1].data;

      const accountApps = applications.filter(app => (
        app.account_sid === accountToDelete.sid
      ));
      const accountPhoneNumbers = phoneNumbers.filter(p => (
        p.account_sid === accountToDelete.sid
      ));
      let errorMessages = [];
      for (const app of accountApps) {
        errorMessages.push(`Application: ${app.name}`);
      }
      for (const num of accountPhoneNumbers) {
        errorMessages.push(`Phone Number: ${num.number}`);
      }
      if (errorMessages.length) {
        return (
          <React.Fragment>
            <p style={{ margin: '0.5rem 0' }}>
              This account cannot be deleted because it is in use by:
            </p>
            <ul style={{ margin: '0.5rem 0' }}>
              {errorMessages.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </React.Fragment>
        );
      }

      // Delete account
      await axios({
        method: 'delete',
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${accountToDelete.sid}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return 'success';
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.clear();
        history.push('/');
        dispatch({
          type: 'ADD',
          level: 'error',
          message: 'Your session has expired. Please log in and try again.',
        });
      } else {
        console.log(err.response || err);
        return ((err.response && err.response.data && err.response.data.msg) || 'Unable to delete account');
      }
    }
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <InternalTemplate
      title="Accounts"
      addButtonText="Add an Account"
      addButtonLink="/internal/accounts/add"
    >
      <TableContent
        name="account"
        urlParam="accounts"
        getContent={getAccounts}
        columns={[
          { header: 'Name',                 key: 'name'      },
          { header: 'SIP Realm',            key: 'sip_realm' },
          { header: 'Registration Webhook', key: 'url'       },
        ]}
        formatContentToDelete={formatAccountToDelete}
        deleteContent={deleteAccount}
      />
    </InternalTemplate>
  );
};

export default AccountsList;
