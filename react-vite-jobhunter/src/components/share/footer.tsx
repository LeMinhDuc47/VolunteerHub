import logo from '@/assets/logo.png';
import '@/styles/footer_style.css';

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
                        {/* Placeholder */}
                        <a href="#" className="social-icon" aria-label="Instagram"></a>
                        <a href="#" className="social-icon" aria-label="YouTube"></a>
                        <a href="#" className="social-icon" aria-label="Chat"></a>
                    </div>
                </div>

                {/* 2. Contact Us*/}
                <div className="footer-column footer-contact">
                    <h1 className="footer-title">Liên hệ</h1>
                    
                    <div className="contact-item">
                        <span className="contact-label">Email</span>
                        <a href="volunteerhub@gmail.com" className="contact-detail">volunteerhub@gmail.com</a>
                    </div>
                    
                    <div className="contact-item">
                        <span className="contact-label">Điện thoại</span>
                        <a href="tel:+925190856789" className="contact-detail">+84 312 141 205</a>
                    </div>
                    
                    <div className="contact-item contact-address">
                        <span className="contact-label">Địa chỉ</span>
                        <p className="contact-detail">
                            144 Xuân Thủy, Hà Nội
                        </p>
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