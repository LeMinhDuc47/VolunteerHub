import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import Navigation from '@/components/share/navigation';
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
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

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
                            <div className="stat-label">Volunteers</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">20+</div>
                            <div className="stat-label">Sponsors</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">90+</div>
                            <div className="stat-label">Events</div>
                        </div>
                    </div>
                    <div className="hero-buttons">
                        <button className="btn-primary">Join Now</button>
                        <button className="btn-secondary">Donate Now</button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="about-container">
                    <h2 className="section-title">About Us</h2>
                    <div className="about-content">
                        <p className="about-text">
                            Welcome to VolunteerHub, where compassion meets action. We are a dedicated 
                            community of volunteers committed to making a positive impact in our society. 
                            Our platform connects passionate individuals with meaningful volunteer opportunities 
                            that align with their interests and skills.
                        </p>
                        <p className="about-text">
                            Since our establishment, we've brought together hundreds of volunteers who have 
                            contributed thousands of hours to various causes. From environmental conservation 
                            to educational support, from healthcare assistance to community development, 
                            our volunteers are the heart and soul of positive change.
                        </p>
                        <p className="about-text">
                            Join us in our mission to create a better world, one volunteer action at a time. 
                            Together, we can make a difference that lasts.
                        </p>
                    </div>
                    <div className="about-features">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Our Mission</h3>
                            <p>Connecting volunteers with opportunities to make meaningful impact</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👁️</div>
                            <h3>Our Vision</h3>
                            <p>A world where everyone contributes to building stronger communities</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💎</div>
                            <h3>Our Values</h3>
                            <p>Compassion, integrity, collaboration, and sustainable impact</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="gallery-section">
                <div className="gallery-container">
                    <h2 className="section-title">Gallery</h2>
                    <p className="gallery-subtitle">Moments that matter - capturing our journey together</p>
                    <div className="gallery-grid">
                        <div className="gallery-item">
                            <img src={g1} alt="Volunteer Activity 1" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g2} alt="Volunteer Activity 2" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g3} alt="Volunteer Activity 3" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g4} alt="Volunteer Activity 4" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g5} alt="Volunteer Activity 5" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                        <div className="gallery-item">
                            <img src={g6} alt="Volunteer Activity 6" />
                            <div className="gallery-overlay">
                                <p></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="footer">
                <div className="footer-content">
                    <p>&copy; 2024 VolunteerHub. All rights reserved.</p>
                    <p>Making a difference, together.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;