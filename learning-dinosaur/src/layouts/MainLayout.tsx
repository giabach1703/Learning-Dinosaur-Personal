import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { useLocation, history, useModel } from 'umi';
import AppSidebar from '../components/common/AppSidebar';
import AppHeader from '../components/common/AppHeader';
import { getToken } from '../services';

const { Content } = Layout;

const MainLayout: React.FC = ({ children }) => {
  const location = useLocation();
  const token = getToken();
  const { refreshUser } = useModel('useAuthModel');

  useEffect(() => {
    if (!token) {
      history.replace('/login');
    } else {
      refreshUser().catch(() => {
        history.replace('/login');
      });
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }, []);

  if (!token) {
    return null;
  }

  const isCreateDeckPage = location.pathname === '/decks/new';

  return (
    <Layout className="app-layout">
      <AppSidebar />

      <Layout>
        <AppHeader />

        <Content
          className={
            isCreateDeckPage
              ? 'app-content app-content-create-deck'
              : 'app-content'
          }
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
