import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea, ProFormDatePicker } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Upload, message, notification, Row } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from "react";
import { callCreateEvent, callUpdateEvent, callUploadSingleFile } from "@/config/api";
import { IEvent } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import dayjs from 'dayjs';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IEvent | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IEventForm {
    name: string;
    address: string;
    startDate?: any;
    endDate?: any;
}

interface IEventLogo {
    name: string;
    uid: string;
}

const ModalEvent = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    //modal animation
    const [animation, setAnimation] = useState<string>('open');

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<IEventLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [value, setValue] = useState<string>("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id && dataInit?.description) {
            setValue(dataInit.description);
            const startDateValue = dataInit.startDate ? dayjs(dataInit.startDate) : undefined;
            const endDateValue = dataInit.endDate ? dayjs(dataInit.endDate) : undefined;
            
            form.setFieldsValue({
                name: dataInit.name,
                address: dataInit.address,
                startDate: startDateValue,
                endDate: endDateValue,
            })
            setDataLogo([{
                name: dataInit.logo,
                uid: uuidv4(),
            }])

        }
    }, [dataInit, form])

    const submitEvent = async (values: any) => {
        const { name, address, startDate, endDate } = values;

        if (dataLogo.length === 0) {
            message.error('Vui lòng upload ảnh Logo')
            return;
        }

        if (!startDate) {
            message.error('Vui lòng chọn ngày bắt đầu');
            return;
        }

        if (!endDate) {
            message.error('Vui lòng chọn ngày kết thúc');
            return;
        }

        if (dayjs(endDate).isBefore(dayjs(startDate))) {
            message.error('Ngày kết thúc không được trước ngày bắt đầu');
            return;
        }

        try {
            const startDateStr = dayjs(startDate).toISOString();
            const endDateStr = dayjs(endDate).toISOString();

            if (dataInit?.id) {
                //update
                const res = await callUpdateEvent(dataInit.id, name, address, value, dataLogo[0].name, startDateStr, endDateStr);
                if (res.data) {
                    message.success("Cập nhật event thành công");
                    handleReset();
                    reloadTable();
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            } else {
                //create
                const res = await callCreateEvent(name, address, value, dataLogo[0].name, startDateStr, endDateStr);
                if (res.data) {
                    message.success("Thêm mới event thành công");
                    handleReset();
                    reloadTable();
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            }
        } catch (error: any) {
            console.error('Error:', error);
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error.message
            });
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setValue("");
        setDataInit(null);

        //add animation when closing modal
        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    }

    const handleRemoveFile = (file: any) => {
        setDataLogo([])
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "event");
        if (res && res.data) {
            setDataLogo([{
                name: res.data.fileName,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataLogo([])
                const error = new Error(res.message);
                onError({ event: error });
            }
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
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật Event" : "Tạo mới Event"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-event ${animation}`,
                            rootClassName: `modal-event-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitEvent}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <ConfigProvider locale={enUS}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên sự kiện"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên sự kiện"
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[{
                                        required: true,
                                        message: 'Vui lòng không bỏ trống',
                                        validator: () => {
                                            if (dataLogo.length > 0) return Promise.resolve();
                                            else return Promise.reject(false);
                                        }
                                    }]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id ?
                                                    [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.logo ?? "",
                                                            status: 'done',
                                                            url: `${import.meta.env.VITE_BACKEND_URL}/storage/event/${dataInit?.logo}`,
                                                        }
                                                    ] : []
                                            }

                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>

                            </Col>

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập địa chỉ sự kiện"
                                    fieldProps={{
                                        autoSize: { minRows: 4 }
                                    }}
                                />
                            </Col>

                            <Col span={12}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',
                                        onMouseDown: (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.tagName !== 'INPUT') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        },
                                        onClick: (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.tagName !== 'INPUT') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        },
                                    }}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>

                            <Col span={12}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',
                                        onMouseDown: (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.tagName !== 'INPUT') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        },
                                        onClick: (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.tagName !== 'INPUT') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        },
                                    }}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>

                            <ProCard
                                title="Miêu tả"
                                // subTitle="mô tả sự  kiện"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </Col>
                            </ProCard>
                        </Row>
                        </ConfigProvider>
                    </ModalForm>
                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalEvent;
