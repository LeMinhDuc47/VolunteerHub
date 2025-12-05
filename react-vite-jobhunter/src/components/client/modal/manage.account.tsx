import { Button, Col, Form, Modal, Row, Select, Table, Tabs, message, notification, Popconfirm, Tag } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from 'react';
import { callCreateSubscriber, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber, callDeleteResume } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { MonitorOutlined, DeleteOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppSelector } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
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

const UserUpdateInfo = (props: any) => {
    return (
        <div>
            //todo
        </div>
    )
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
            children: <UserUpdateInfo />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: `//todo`,
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