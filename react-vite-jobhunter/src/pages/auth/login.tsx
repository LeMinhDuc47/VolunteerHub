import { Button, Divider, Form, Input, message, notification } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogin } from 'config/api';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserLoginInfo } from '@/redux/slice/accountSlide';
import '@/styles/login_style.css';
import { useAppSelector } from '@/redux/hooks';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const dispatch = useDispatch();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const callback = params?.get("callback");

    useEffect(() => {
        // Đã login => redirect to '/home'
        if (isAuthenticated) {
            window.location.href = '/home';
        }
    }, [])

    const onFinish = async (values: any) => {
        const { username, password } = values;
        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);

        if (res?.data) {
            localStorage.setItem('access_token', res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user))
            message.success('Sign In Successful!');
            // Redirect đến /home sau khi đăng nhập, hoặc callback nếu có
            window.location.href = callback ? callback : '/home';
        } else {
            const rawMessage = res?.message && Array.isArray(res.message) ? res.message[0] : res?.message;
            const isBadCredentials =
                res?.statusCode === 401 ||
                rawMessage === 'Bad credentials' ||
                (typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('bad credential'));

            notification.error({
                message: "Đăng nhập thất bại",
                description: isBadCredentials
                    ? "Bạn đã nhập sai tài khoản hoặc mật khẩu"
                    : (rawMessage ?? "Đã có lỗi xảy ra. Vui lòng thử lại."),
                duration: 5
            })
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="login-page">
            <div className="login-background"></div>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Đăng nhập</h2>
                        <Divider />
                    </div>
                    
                    <Form
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        className="login-form"
                    >
                        <Form.Item
                            label="Email"
                            name="username"
                            rules={[{ required: true, message: 'Email không được bỏ trống!' }]}
                        >
                            <Input size="large" placeholder="Nhập email của bạn" />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Mật khẩu không được bỏ trống!' }]}
                        >
                            <Input.Password size="large" placeholder="Nhập mật khẩu của bạn" />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={isSubmit}
                                size="large"
                                block
                                className="login-button"
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                        
                        <Divider>Hoặc</Divider>

                        <Button
                            icon={<GoogleOutlined />}
                            size="large"
                            block
                            className="google-login-btn"
                            onClick={handleGoogleLogin}
                        >
                            Đăng nhập bằng Google
                        </Button>
                        
                        <p className="login-footer-text">
                            Chưa có tài khoản?{' '}
                            <Link to='/register' className="register-link">Đăng ký</Link>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;