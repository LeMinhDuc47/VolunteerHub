import { useState, useEffect, useRef } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import '@/styles/navigation_style.css';
import logo from '@/assets/logo.png';

const Navigation = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    const [isMobileMode, setIsMobileMode] = useState<boolean>(window.innerWidth <= 1024);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const isScrollingByClick = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileMode(window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); 

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (isScrollingByClick.current) return;

            const sections = ['home', 'about', 'gallery'];
            const scrollPosition = window.scrollY + 150; 

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    } 
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        
        isScrollingByClick.current = true;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingByClick.current = false;
            }, 1000);

            setOpenMobileMenu(false);
        }
    };

    return (
        <>
            <nav className="navigation">
                <div className="nav-container">
                    <div 
                        className="nav-logo" 
                        onClick={() => navigate(isAuthenticated ? '/home' : '/')}
                    >
                        <img src={logo} alt="VolunteerHub Logo" />
                    </div>
                    
                    {!isMobileMode ? (
                        <>
                            <div className="nav-menu">
                                <button 
                                    className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('home')}
                                >
                                    Trang chủ
                                </button>
                                <button 
                                    className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('about')}
                                >
                                    Giới thiệu
                                </button>
                                <button 
                                    className={`nav-link ${activeSection === 'gallery' ? 'active' : ''}`}
                                    onClick={() => scrollToSection('gallery')}
                                >
                                    Thư viện ảnh
                                </button>
                                <button 
                                    className="nav-link" 
                                    onClick={() => scrollToSection('footer')}
                                >
                                    Liên hệ
                                </button>
                            </div>

                            <div className="nav-actions">
                                <Link to="/login" className="nav-signin">Đăng nhập</Link>
                                <Link to="/register" className="nav-button">Tham gia</Link>
                            </div>
                        </>
                    ) : (
                        <button 
                            className="nav-mobile-menu-btn"
                            onClick={() => setOpenMobileMenu(true)}
                        >
                            ☰
                        </button>
                    )}
                </div>
            </nav>

             {openMobileMenu && (
                <div className="nav-drawer-overlay" onClick={() => setOpenMobileMenu(false)}>
                    <div className="nav-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="nav-drawer-header">
                            <h3>Menu</h3>
                            <button className="nav-drawer-close" onClick={() => setOpenMobileMenu(false)}>✕</button>
                        </div>
                        <div className="nav-drawer-content">
                            <button className={`nav-drawer-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => scrollToSection('home')}>Trang chủ</button>
                            <button className={`nav-drawer-item ${activeSection === 'about' ? 'active' : ''}`} onClick={() => scrollToSection('about')}>Giới thiệu</button>
                            <button className={`nav-drawer-item ${activeSection === 'gallery' ? 'active' : ''}`} onClick={() => scrollToSection('gallery')}>Thư viện ảnh</button>
                            <button className="nav-drawer-item" onClick={() => scrollToSection('footer')}>Liên hệ</button>
                            <div className="nav-drawer-divider"></div>
                            <Link to="/login" className="nav-drawer-item" onClick={() => setOpenMobileMenu(false)}>Đăng nhập</Link>
                            <Link to="/register" className="nav-drawer-item highlight" onClick={() => setOpenMobileMenu(false)}>Tham gia ngay</Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;