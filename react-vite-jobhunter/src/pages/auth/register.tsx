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
                        <h2>Create an account</h2>
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
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Name cannot be left blank!' }]}
                                >
                                    <Input size="large" placeholder="Enter your name" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Email cannot be left blank!' }]}
                                >
                                    <Input size="large" type='email' placeholder="Enter your email" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{ required: true, message: 'Password cannot be left blank!' }]}
                                >
                                    <Input.Password size="large" placeholder="Enter your password" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Age"
                                    name="age"
                                    rules={[{ required: true, message: 'Age cannot be left blank!' }]}
                                >
                                    <Input size="large" type='number' placeholder="Enter your age" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="gender"
                                    label="Gender"
                                    rules={[{ required: true, message: 'Gender cannot be left blank!' }]}
                                >
                                    <Select size="large" placeholder="Choose gender" allowClear>
                                        <Option value="MALE">Male</Option>
                                        <Option value="FEMALE">Female</Option>
                                        <Option value="OTHER">Other</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Address"
                                    name="address"
                                    rules={[{ required: true, message: 'Address cannot be left blank!' }]}
                                >
                                    <Input size="large" placeholder="Enter your address" />
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
                        
                        <Divider>Or</Divider>
                        
                        <p className="register-footer-text">
                            Already have an account?{' '}
                            <Link to='/login' className="login-link">Sign In</Link>
                        </p>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;