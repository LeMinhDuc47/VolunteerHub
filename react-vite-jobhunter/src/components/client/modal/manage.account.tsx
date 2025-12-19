import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Spin, Table, Tabs, message, notification, Popconfirm, Tag } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callDeleteResume, callFetchUserById, callUpdateUserInfo, callChangePassword } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";
import { useNavigate } from "react-router-dom";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

interface IUserUpdateInfoProps {
    open: boolean;
}

interface IUserPasswordProps {
    open: boolean;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const navigate = useNavigate();
    const { onClose } = props; 

    const fetchResumes = async () => {
        setIsFetching(true);
        const res = await callFetchResumeByUser();
        if (res && res.data) {
            setListCV(res.data.result as IResume[]);
        }
        setIsFetching(false);
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleDeleteResume = async (id: string) => {
        if (!id) return;
        try {
            const res = await callDeleteResume(id);
            const statusCode = +res?.statusCode;
            const isSuccess = statusCode === 200 || statusCode === 204;
            if (isSuccess) {
                message.success('Hủy đăng ký thành công');
                await fetchResumes();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: (res?.error || res?.message) ?? 'Không thể hủy đăng ký'
                });
            }
        } catch (e: any) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: e?.message || 'Không thể hủy đăng ký'
            });
        }
    };

    const renderStatus = (status: string) => {
        let color: string = 'default';
        switch (status) {
            case 'Pending':
                color = 'orange';
                break;
            case 'Approved':
                color = 'green';
                break;
            case 'Rejected':
                color = 'red';
                break;
        }
        return <Tag color={color}>{status}</Tag>;
    };

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: 'center',
            render: (text, record, index) => <>{index + 1}</>
        },
        {
            title: 'Job title',
            dataIndex: ['job', 'name']
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (value: any, record: IResume) => renderStatus(record.status as string)
        },
        {
            title: 'Ngày rải CV',
            dataIndex: 'createdAt',
            render: (value: any, record: IResume) => <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
        },
        {
            title: '',
            dataIndex: '',
            render: (_value: any, record: IResume) => (
                <Button
                    type="link"
                    onClick={() => {
                        if (record.job?.id) {
                            if (onClose) onClose(false);         
                            navigate(`/home/job/${record.job.id}`); 
                        }
                    }}
                >
                    Chi tiết
                </Button>
            )
        },

        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (value: any, record: IResume) => (
                <Popconfirm
                    title="Xác nhận"
                    description="Bạn có chắc chắn muốn hủy tham gia hoạt động này không?"
                    okText="Đồng ý"
                    cancelText="Hủy"
                    onConfirm={() => handleDeleteResume(record.id + '')}
                >
                    <Button danger type="text" icon={<DeleteOutlined />}></Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
                rowKey={(record) => record.id + ''}
            />
        </div>
    );
};

const genderOptions = [
    { label: 'Nam', value: 'MALE' },
    { label: 'Nữ', value: 'FEMALE' },
    { label: 'Khác', value: 'OTHER' },
];

const UserUpdateInfo = ({ open }: IUserUpdateInfoProps) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const dispatch = useAppDispatch();
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            return;
        }
        const fetchProfile = async () => {
            if (!user?.id) return;
            setIsFetching(true);
            try {
                const res = await callFetchUserById(user.id);
                if (res?.data) {
                    form.setFieldsValue({
                        email: res.data.email,
                        name: res.data.name,
                        age: res.data.age,
                        gender: res.data.gender,
                        address: res.data.address,
                    });
                }
            } catch (error: any) {
                notification.error({
                    message: 'Không thể tải thông tin người dùng',
                    description: error?.message || 'Vui lòng thử lại sau',
                });
            } finally {
                setIsFetching(false);
            }
        };
        fetchProfile();
    }, [open, user?.id]);

    const onFinish = async (values: any) => {
        if (!user?.id) return;
        setIsSubmitting(true);
        try {
            const payload = {
                id: user.id,
                name: values.name,
                age: values.age,
                gender: values.gender,
                address: values.address,
            };
            const res = await callUpdateUserInfo(payload);
            if (res?.data) {
                message.success('Cập nhật thông tin thành công');
                dispatch(fetchAccount());
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res?.message || 'Không thể cập nhật thông tin',
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật thông tin',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Spin spinning={isFetching}>
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
            >
                <Row gutter={[20, 0]}>
                    <Col span={24}>
                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="Nhập họ tên" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Tuổi"
                            name="age"
                            rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%', height: '40px'}} placeholder="Nhập tuổi" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Giới tính"
                            name="gender"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                        >
                            <Select options={genderOptions} style={{ width: '100%', height: '40px'}} placeholder="Chọn giới tính" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" loading={isSubmitting} onClick={() => form.submit()}>
                            Lưu thay đổi
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Spin>
    );
}

const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }


        } else {
            //update subscriber
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }


    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const UserPassword = ({ open }: IUserPasswordProps) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await callChangePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            const parsedStatus =
                res && typeof res === 'object' && 'statusCode' in res
                    ? Number((res as any).statusCode)
                    : typeof res === 'string'
                        ? 200
                        : NaN;

            if (!Number.isNaN(parsedStatus) && parsedStatus >= 200 && parsedStatus < 300) {
                const successMessage =
                    (typeof res === 'object' && (res as any)?.message) || (typeof res === 'string' ? res : null) ||
                    'Đổi mật khẩu thành công';
                message.success(Array.isArray(successMessage) ? successMessage[0] : successMessage);
                form.resetFields();
            } else {
                const errorMessage =
                    (typeof res === 'object' && (res as any)?.message) || 'Không thể đổi mật khẩu';
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
                });
            }
        } catch (error: any) {
            const description = error?.response?.data?.message || error?.message || 'Không thể đổi mật khẩu';
            notification.error({
                message: 'Có lỗi xảy ra',
                description: Array.isArray(description) ? description[0] : description,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <style>
        {`
        .ant-modal .ant-form-item-control-input {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .ant-modal .ant-form-item-control-input-content {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }

        .ant-modal input.ant-input {
            height: 40px !important;
            border: 1px solid #d9d9d9 !important;
            border-radius: 6px !important;
            padding: 0 12px !important;
            font-size: 14px !important;
        }

        .ant-modal .ant-input-password .ant-input-suffix {
            position: absolute !important;
            right: 12px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
        }

        .ant-modal .ant-select-selector {
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            border-radius: 6px !important;
        }

        .ant-modal .ant-form-item-label > label {
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            font-weight: 500 !important;
            color: rgba(0,0,0,0.88) !important;
        }

        .ant-modal-body .ant-input-affix-wrapper {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
            height: auto !important;
        }

        .ant-modal-body .ant-input-affix-wrapper > input.ant-input {
            height: 40px !important;
            border: 1px solid #d9d9d9 !important;
            border-radius: 6px !important;
            padding: 0 12px !important;
            font-size: 14px !important;
        }

        .ant-modal-body .ant-input-affix-wrapper-focused > input.ant-input {
            border-color: #4096ff !important;
            box-shadow: 0 0 0 2px rgba(64,150,255,0.2) !important;
        }

        .ant-modal-body .ant-input-affix-wrapper .ant-input-suffix {
            position: absolute !important;
            right: 12px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
        }
        `}
        </style>
        <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
        >
            <Row gutter={[20, 0]}>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value === getFieldValue('currentPassword')) {
                                        return Promise.reject(new Error('Mật khẩu mới phải khác mật khẩu cũ'));
                                    }
                                    return Promise.resolve();
                                },
                            })
                        ]}
                    >
                        <Input.Password autoComplete="new-password" placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (value !== getFieldValue('newPassword')) {
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                    }
                                    return Promise.resolve();
                                },
                            })
                        ]}
                    >
                        <Input.Password autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" loading={isSubmitting} onClick={() => form.submit()}>
                        Đổi mật khẩu
                    </Button>
                </Col>
            </Row>
        </Form>
    </>
    );
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume onClose={onClose} />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo open={open} />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <UserPassword open={open} />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;