import { Button, Divider, Form, Input, message, notification } from 'antd';
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
            notification.error({
                message: "Error!",
                description:
                    res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                duration: 5
            })
        }
    };

    return (
        <div className="login-page">
            <div className="login-background"></div>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Sign In</h2>
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
                            rules={[{ required: true, message: 'Email cannot be left blank!' }]}
                        >
                            <Input size="large" placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Password cannot be left blank!' }]}
                        >
                            <Input.Password size="large" placeholder="Enter your password" />
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
                                Sign In
                            </Button>
                        </Form.Item>
                        
                        <Divider>Or</Divider>
                        
                        <p className="login-footer-text">
                            Don't have an account?{' '}
                            <Link to='/register' className="register-link">Register</Link>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;