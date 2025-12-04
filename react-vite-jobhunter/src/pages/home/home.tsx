import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import Navigation from '@/components/share/navigation';
import Footer from '@/components/share/footer';
import '@/styles/home_style.css';
import backgroundImg from '@/assets/background.jpeg';
import g1 from '@/assets/g1.jpg';
import g2 from '@/assets/g2.jpg';
import g3 from '@/assets/g3.jpg';
import g4 from '@/assets/g4.jpg';
import g5 from '@/assets/g5.jpg';
import g6 from '@/assets/g6.jpg';

const HomePage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (isAuthenticated) {
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="home-page">
            <Navigation />
            
            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-overlay"></div>
                <div 
                    className="hero-background"
                    style={{ backgroundImage: `url(${backgroundImg})` }}
                ></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Making a Difference, <span className="highlight">Together</span>
                    </h1>
                    <p className="hero-subtitle">
                        "The best way to find yourself is to lose yourself in the service of others"
                    </p>
                    <p className="hero-author">- Mahatma Gandhi -</p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Tình nguyện viên</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">20+</div>
                            <div className="stat-label">Nhà tài trợ</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">90+</div>
                            <div className="stat-label">Sự kiện</div>
                        </div>
                    </div>
                    <div className="hero-buttons">
                        <Link to="/login" className="btn-primary">Tham gia ngay</Link>
                        <Link to="/home/donate-us" className="btn-secondary">Ủng hộ chúng tôi</Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <h2 className="section-title">Về chúng tôi</h2>
                    <div className="about-content">
                        <p className="about-text">
                            Chào mừng đến với VolunteerHub, nơi lòng nhân ái gặp gỡ hành động. Chúng tôi là 
                            một cộng đồng tình nguyện viên tận tâm, cam kết tạo ra những tác động tích cực 
                            trong xã hội. Nền tảng của chúng tôi kết nối những cá nhân đầy nhiệt huyết với 
                            các cơ hội tình nguyện ý nghĩa phù hợp với sở thích và kỹ năng của họ.
                        </p>
                        <p className="about-text">
                            Kể từ khi thành lập, chúng tôi đã tập hợp hàng trăm tình nguyện viên đóng góp 
                            hàng nghìn giờ cho nhiều mục đích khác nhau. Từ bảo tồn môi trường đến hỗ trợ 
                            giáo dục, từ hỗ trợ y tế đến phát triển cộng đồng, các tình nguyện viên của 
                            chúng tôi là trái tim và linh hồn của sự thay đổi tích cực.
                        </p>
                        <p className="about-text">
                            Hãy tham gia cùng chúng tôi trong sứ mệnh tạo ra một thế giới tốt đẹp hơn, 
                            từng hành động tình nguyện một. Cùng nhau, chúng ta có thể tạo nên sự khác biệt 
                            bền vững.
                        </p>
                    </div>
                    <div className="about-features">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Sứ mệnh</h3>
                            <p>Kết nối tình nguyện viên với cơ hội tạo tác động có ý nghĩa đến cộng đồng</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👁️</div>
                            <h3>Tầm nhìn</h3>
                            <p>Một thế giới nơi mọi người đóng góp vào việc xây dựng cộng đồng vững mạnh hơn</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3>Giá trị cốt lõi</h3>
                            <p>Lòng trcompassion, chính trực, hợp tác và tác động bền vững</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="gallery-section">
                <div className="gallery-container">
                    <h2 className="section-title">Thư viện ảnh</h2>
                    <p className="gallery-subtitle">Những khoảnh khắc ý nghĩa - ghi lại hành trình của chúng ta</p>
                    <div className="gallery-grid">
                        <div className="gallery-item">
                            <img src={g1} alt="Hoạt động tình nguyện 1" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g2} alt="Hoạt động tình nguyện 2" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g3} alt="Hoạt động tình nguyện 3" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g4} alt="Hoạt động tình nguyện 4" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g5} alt="Hoạt động tình nguyện 5" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g6} alt="Hoạt động tình nguyện 6" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;