import { Button, Divider, Form, Input, Select, message, notification, Row, Col } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import '@/styles/register_style.css';
import { IUser } from '@/types/backend';
const { Option } = Select;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish = async (values: IUser) => {
        const { name, email, password, age, gender, address } = values;
        setIsSubmit(true);
        const res = await callRegister(name, email, password as string, +age, gender, address);
        setIsSubmit(false);
        if (res?.data?.id) {
            message.success('Account registration successful!');
            navigate('/login')
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
        <div className="register-page">
            <div className="register-background"></div>
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h2>Tạo một tài khoản</h2>
                        <Divider />
                    </div>
                    
                    <Form<IUser>
                        name="basic"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        className="register-form"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Họ tên"
                                    name="name"
                                    rules={[{ required: true, message: 'Họ tên không được bỏ trống!' }]}
                                >
                                    <Input size="large" placeholder="Nhập họ tên của bạn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Email không được bỏ trống!' }]}
                                >
                                    <Input size="large" type='email' placeholder="Nhập email của bạn" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[{ required: true, message: 'Mật khẩu không được bỏ trống!' }]}
                                >
                                    <Input.Password size="large" placeholder="Nhập mật khẩu của bạn" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Tuổi"
                                    name="age"
                                    rules={[{ required: true, message: 'Tuổi không được bỏ trống!' }]}
                                >
                                    <Input size="large" type='number' placeholder="Nhập tuổi của bạn" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                    rules={[{ required: true, message: 'Giới tính không được bỏ trống!' }]}
                                >
                                    <Select size="large" placeholder="Chọn giới tính" allowClear>
                                        <Option value="MALE">Nam</Option>
                                        <Option value="FEMALE">Nữ</Option>
                                        <Option value="OTHER">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Địa chỉ không được bỏ trống!' }]}
                                >
                                    <Input size="large" placeholder="Nhập địa chỉ của bạn" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={isSubmit}
                                size="large"
                                block
                                className="register-button"
                            >
                                Register
                            </Button>
                        </Form.Item>
                        
                        <Divider>Hoặc</Divider>
                        
                        <p className="register-footer-text">
                            Đã có tài khoản?{' '}
                            <Link to='/login' className="login-link">Đăng nhập</Link>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;