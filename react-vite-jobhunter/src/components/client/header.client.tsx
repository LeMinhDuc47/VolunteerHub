import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import { Badge, Dropdown, Space, notification } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import dayjs from 'dayjs';
import '@/styles/client/header_style.css';
import logo from '@/assets/logo.png';

type ServerNotificationPayload = {
    resumeId?: number;
    status?: string;
    email?: string;
    jobName?: string;
    eventName?: string;
    message?: string;
    timestamp?: string;
};

type ResumeNotification = {
    id: string;
    resumeId?: number;
    message: string;
    status?: string;
    jobName?: string;
    eventName?: string;
    timestamp: string;
};

const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT ?? 'http://localhost:8080/ws';

const mapServerNotification = (payload: ServerNotificationPayload): ResumeNotification => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    return {
        id,
        resumeId: payload.resumeId,
        status: payload.status,
        jobName: payload.jobName,
        eventName: payload.eventName,
        message: payload.message ?? 'Hồ sơ của bạn vừa được cập nhật.',
        timestamp: payload.timestamp ?? new Date().toISOString()
    };
};

const Header = (props: any) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
    const [current, setCurrent] = useState('/home');
    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<ResumeNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [openNotifications, setOpenNotifications] = useState<boolean>(false);
    const [isMobileMode, setIsMobileMode] = useState<boolean>(window.innerWidth <= 768);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileMode(window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            setNotifications([]);
            setUnreadCount(0);
            setOpenNotifications(false);
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            return;
        }

        const accessToken = typeof window !== 'undefined'
            ? window.localStorage.getItem('access_token')
            : null;
        if (!accessToken) {
            return;
        }

        const delimiter = WS_ENDPOINT.includes('?') ? '&' : '?';
        const socketUrl = `${WS_ENDPOINT}${delimiter}access_token=${encodeURIComponent(accessToken)}`;

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl) as any,
            connectHeaders: { Authorization: `Bearer ${accessToken}` },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe('/user/queue/notifications', (message: IMessage) => {
                    if (!message.body) return;
                    try {
                        const payload = JSON.parse(message.body) as ServerNotificationPayload;
                        const model = mapServerNotification(payload);
                        setNotifications(prev => [model, ...prev].slice(0, 20));
                        setUnreadCount(prev => prev + 1);
        

notification.open({
    message: <span style={{ fontWeight: 600 }}>Thông báo mới</span>,
    description: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {}
            <div>
                {model.message}
            </div>

            {}
            {model.jobName && (
                <div style={{ fontSize: '13px', color: '#555' }}>
                    Công việc: <b>{model.jobName}</b>
                </div>
            )}

            {}
            <div style={{ 
                fontSize: '11px', 
                color: '#888', 
                marginTop: '6px', 
                borderTop: '1px solid #eee', 
                paddingTop: '4px',
                display: 'flex',
                justifyContent: 'flex-end' 
            }}>
                {dayjs(model.timestamp).format('HH:mm - DD/MM/YYYY')}
            </div>
        </div>
    ),
    placement: 'topRight', 
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
    duration: 5,
    style: {
        width: 350,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderLeft: '4px solid #52c41a'
    }
});
                    } catch (error) {
                        console.error('Không thể phân tích thông báo', error);
                    }
                });
            },
            onStompError: frame => {
                console.error('STOMP error', frame.headers['message']);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
            stompClientRef.current = null;
        };
    }, [isAuthenticated, user?.email]);

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            window.location.replace('/');
        }
    };

    const menuItems = [
        { key: '/home', label: 'Trang chủ', path: '/home' },
        { key: '/home/job', label: 'Hoạt động tình nguyện', path: '/home/job' },
        { key: '/home/event', label: 'Sự kiện nổi bật', path: '/home/event' }
    ];

    const notificationMenuItems: MenuProps['items'] = notifications.length
        ? notifications.map(item => ({
              key: item.id,
              label: (
                  <div className="header-notification-item">
                      <div className="header-notification-message">{item.message}</div>
                      <div className="header-notification-meta">
                          {item.jobName && <span className="job-name">{item.jobName}</span>}
                          <span>{dayjs(item.timestamp).format('HH:mm DD/MM')}</span>
                      </div>
                  </div>
              )
          }))
        : [{
              key: 'empty',
              disabled: true,
              label: <div className="header-notification-empty">Chưa có thông báo</div>
          }];

    const notificationMenu: MenuProps = { items: notificationMenuItems };

    return (
        <>
            <div className="header-section">
                <div className="header-container">
                    {!isMobileMode ? (
                        <>
                            <div className="header-logo" onClick={() => navigate('/home')}>
                                <img src={logo} alt="Logo" />
                            </div>

                            <div className="header-menu">
                                {menuItems.map(item => (
                                    <Link
                                        key={item.key}
                                        to={item.path}
                                        className={`header-menu-item ${current === item.key ? 'active' : ''}`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="header-actions">
                                {isAuthenticated && (
                                    <Dropdown
                                        menu={notificationMenu}
                                        trigger={["click"]}
                                        open={openNotifications}
                                        onOpenChange={(open) => {
                                            setOpenNotifications(open);
                                            if (open) {
                                                setUnreadCount(0);
                                            }
                                        }}
                                    >
                                        <div className="header-bell" onClick={(e) => e.preventDefault()}>
                                            <Badge count={unreadCount} size="small" overflowCount={99}>
                                                <BellOutlined />
                                            </Badge>
                                        </div>
                                    </Dropdown>
                                )}
                                {isAuthenticated === false ? (
                                    <Link to="/login" className="header-login">Đăng Nhập</Link>
                                ) : (
                                    <div className="header-user-section">
                                        <div 
                                            className="header-user-info"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                        >
                                            <span className="header-welcome">Welcome {user?.name}</span>
                                            <div className="header-avatar">
                                                {user?.name?.substring(0, 2)?.toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        {showDropdown && (
                                            <div className="header-dropdown">
                                                <div 
                                                    className="header-dropdown-item"
                                                    onClick={() => {
                                                        setOpenManageAccount(true);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <span className="dropdown-icon"></span>
                                                    <span>Quản lý tài khoản</span>
                                                </div>
                                                
                                                {(user.role?.permissions?.length ?? 0) > 0 && (
                                                    <Link 
                                                        to="/admin"
                                                        className="header-dropdown-item"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        <span className="dropdown-icon"></span>
                                                        <span>Trang Quản Trị</span>
                                                    </Link>
                                                )}
                                                
                                                <div 
                                                    className="header-dropdown-item"
                                                    onClick={() => {
                                                        handleLogout();
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <span className="dropdown-icon"></span>
                                                    <span>Đăng xuất</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="header-mobile">
                            <div className="header-logo" onClick={() => navigate('/home')}>
                                <img src={logo} alt="Logo" />
                            </div>
                            <button 
                                className="header-mobile-menu-btn"
                                onClick={() => setOpenMobileMenu(true)}
                            >
                                ☰
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {openMobileMenu && (
                 <div className="header-drawer-overlay" onClick={() => setOpenMobileMenu(false)}>
                    <div className="header-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="header-drawer-header">
                            <h3>Chức năng</h3>
                            <button 
                                className="header-drawer-close"
                                onClick={() => setOpenMobileMenu(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="header-drawer-content">
                            {menuItems.map(item => (
                                <Link
                                    key={item.key}
                                    to={item.path}
                                    className={`header-drawer-item ${current === item.key ? 'active' : ''}`}
                                    onClick={() => setOpenMobileMenu(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            
                            {isAuthenticated && (
                                <>
                                    <div className="header-drawer-divider"></div>
                                    
                                    <div 
                                        className="header-drawer-item"
                                        onClick={() => {
                                            setOpenManageAccount(true);
                                            setOpenMobileMenu(false);
                                        }}
                                    >
                                        Quản lý tài khoản
                                    </div>
                                    
                                    {(user.role?.permissions?.length ?? 0) > 0 && (
                                        <Link 
                                            to="/admin"
                                            className="header-drawer-item"
                                            onClick={() => setOpenMobileMenu(false)}
                                        >
                                        Trang Quản Trị
                                        </Link>
                                    )}
                                    
                                    <div 
                                        className="header-drawer-item"
                                        onClick={() => {
                                            handleLogout();
                                            setOpenMobileMenu(false);
                                        }}
                                    >
                                        Đăng xuất
                                    </div>
                                </>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="header-drawer-item"
                                    onClick={() => setOpenMobileMenu(false)}
                                >
                                Đăng Nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    );
};

export default Header;