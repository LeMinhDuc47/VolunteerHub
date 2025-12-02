import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import '@/styles/client/header_style.css';
import logo from '@/assets/logo.png';

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

    const [isMobileMode, setIsMobileMode] = useState<boolean>(window.innerWidth <= 768);

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