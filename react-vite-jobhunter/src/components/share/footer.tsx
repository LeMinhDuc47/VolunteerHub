import logo from '@/assets/logo.png';
import '@/styles/footer_style.css';
import { FaGoogle, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <footer id="footer" className="footer-section">
            <div className="footer-container">
                
                {/* 1. Logo và Giới thiệu*/}
                <div className="footer-column footer-about">
                    <div className="footer-logo">
                        <img src={logo} alt="VolunteerHub Logo" />
                    </div>

                    <p className="about-text">
                       Chúng tôi là một cộng đồng đầy nhiệt huyết, luôn nỗ lực tạo ra những thay đổi tích cực 
                       thông qua các hoạt động tình nguyện, phục vụ cộng đồng và những sáng kiến vì xã hội. Hãy 
                       cùng chúng tôi chung tay làm cho thế giới trở nên tốt đẹp hơn.
                    </p>

                    <div className="social-links">
                        <a href="https://www.google.com" className="social-icon" aria-label="Google">
                            <FaGoogle />
                        </a>
                        <a href="https://www.facebook.com" className="social-icon" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://www.instagram.com" className="social-icon" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                    </div>
                </div>

                {/* 2. Contact Us*/}
                <div className="footer-column footer-contact">
                    <h1 className="footer-title">Liên hệ</h1>
                    
                    <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <div>
                            <span className="contact-label">Email</span>
                            <a href="mailto:volunteerhub@gmail.com" className="contact-detail">
                                volunteerhub@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className="contact-item">
                        <FaPhoneAlt className="contact-icon" />
                        <div>
                            <span className="contact-label">Điện thoại</span>
                            <a href="tel:+84312141205" className="contact-detail">
                                +84 312 141 205
                            </a>
                        </div>
                    </div>

                    <div className="contact-item">
                        <FaMapMarkerAlt className="contact-icon" />
                        <div>
                            <span className="contact-label">Địa chỉ</span>
                            <p className="contact-detail">144 Xuân Thủy, Hà Nội</p>
                        </div>
                    </div>

                </div>

            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2025 Volunteer Hub. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
