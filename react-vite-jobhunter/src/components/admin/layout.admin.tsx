import React, { useState, useEffect } from 'react';
import {
  AppstoreOutlined,
  ExceptionOutlined,
  ApiOutlined,
  UserOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AliwangwangOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';

import uetLogo from '@/assets/uet-logo.png';
import "@/styles/components/admin/layout_style.css"

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const user = useAppSelector(state => state.account.user);

  const permissions = useAppSelector(state => state.account.user.role.permissions);
  const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
    if (permissions?.length || ACL_ENABLE === 'false') {
      const viewEvent = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.EVENTS.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.EVENTS.GET_PAGINATE.method
      );

      const viewUser = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const viewJob = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
      );

      const viewResume = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
      );

      const viewRole = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
      );

      const viewPermission = permissions?.find(item =>
        item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
        && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const full: MenuProps['items'] = [
        {
          label: <Link to='/admin'>Dashboard</Link>,
          key: '/admin',
          icon: <AppstoreOutlined />
        },
        ...(viewEvent || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/event'>Event</Link>,
          key: '/admin/event',
          icon: <BankOutlined />,
        }] : []),

        ...(viewUser || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/user'>User</Link>,
          key: '/admin/user',
          icon: <UserOutlined />
        }] : []),

        ...(viewJob || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/job'>Job</Link>,
          key: '/admin/job',
          icon: <ScheduleOutlined />
        }] : []),

        ...(viewResume || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/resume'>Resume</Link>,
          key: '/admin/resume',
          icon: <AliwangwangOutlined />
        }] : []),

        ...(viewPermission || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/permission'>Permission</Link>,
          key: '/admin/permission',
          icon: <ApiOutlined />
        }] : []),

        ...(viewRole || ACL_ENABLE === 'false' ? [{
          label: <Link to='/admin/role'>Role</Link>,
          key: '/admin/role',
          icon: <ExceptionOutlined />
        }] : []),
      ];

      setMenuItems(full);
    }
  }, [permissions]);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    const res = await callLogout();
    if (res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      message.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  const itemsDropdown = [
    {
      label: <Link to={'/'}>Trang chủ</Link>,
      key: 'home',
    },
    {
      label: (
        <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: 'logout',
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: '100vh' }} className="layout-admin">
        {!isMobile ? (
          <Sider
            className="admin-sider"
            theme="dark"
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={240}
            collapsedWidth={80}
            trigger={null}
          >
            <div className="admin-sider__brand">
              <img className="admin-sider__logo" src={uetLogo} alt="UET" />
            </div>

            <Menu
              selectedKeys={[activeMenu]}
              mode="inline"
              theme="dark"
              items={menuItems}
              onClick={(e) => setActiveMenu(e.key)}
            />
          </Sider>
        ) : (
          <Menu
            selectedKeys={[activeMenu]}
            items={menuItems}
            onClick={(e) => setActiveMenu(e.key)}
            mode="horizontal"
          />
        )}

        <Layout>
          {!isMobile && (
            <div className="admin-header">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />

              <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                <Space style={{ cursor: "pointer" }}>
                  Welcome {user?.name}
                  <Avatar>{user?.name?.substring(0, 2)?.toUpperCase()}</Avatar>
                </Space>
              </Dropdown>
            </div>
          )}

          <Content style={{ padding: 20 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutAdmin;