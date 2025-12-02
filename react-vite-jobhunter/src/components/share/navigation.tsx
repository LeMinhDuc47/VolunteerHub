import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import '@/styles/navigation_style.css';
import logo from '@/assets/logo.png';

const Navigation = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'about', 'gallery'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    } else {
                        setActiveSection('');
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            if (['home', 'about', 'gallery'].includes(sectionId)) {
                setActiveSection(sectionId);
            } else {
                setActiveSection('');
            }
        }
    };

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div 
                    className="nav-logo" 
                    onClick={() => navigate(isAuthenticated ? '/home' : '/')}
                >
                    <img src={logo} alt="VolunteerHub Logo" />
                </div>
                
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
            </div>
        </nav>
    );
};

export default Navigation;