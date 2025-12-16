import { FooterToolbar, ModalForm, ProCard, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { callCreateRole, callFetchPermission, callUpdateRole } from "@/config/api";
import { IPermission, IRole } from "@/types/backend";
import { CheckSquareOutlined } from "@ant-design/icons";
import ModuleApi from "./module.api";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetSingleRole } from "@/redux/slice/roleSlide";
import { groupByPermission } from "@/config/utils";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    listPermissions: {
        module: string;
        permissions: IPermission[]
    }[];
    singleRole: IRole | null;
    setSingleRole: (v: any) => void;
}

const ModalRole = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, listPermissions, singleRole, setSingleRole } = props;
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();

    const submitRole = async (valuesForm: any) => {
        const { description, active, name, permissions } = valuesForm;
        const checkedPermissions = [];

        if (permissions) {
            for (const key in permissions) {
                if (key.match(/^[1-9][0-9]*$/) && permissions[key] === true) {
                    checkedPermissions.push({ id: key });
                }
            }
        }

        if (singleRole?.id) {
            //update
            const role = {
                name, description, active, permissions: checkedPermissions
            }
            const res = await callUpdateRole(role, singleRole.id);
            if (res.data) {
                message.success("Cập nhật role thành công");
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
            const role = {
                name, description, active, permissions: checkedPermissions
            }
            const res = await callCreateRole(role);
            if (res.data) {
                message.success("Thêm mới role thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setOpenModal(false);
        setSingleRole(null);
    }

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
            <ModalForm
                title={<>{singleRole?.id ? "Cập nhật Role" : "Tạo mới Role"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,

                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitRole}
                submitter={{
                    render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                    submitButtonProps: {
                        icon: <CheckSquareOutlined />
                    },
                    searchConfig: {
                        resetText: "Hủy",
                        submitText: <>{singleRole?.id ? "Cập nhật" : "Tạo mới"}</>,
                    }
                }}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên Role"
                            name="name"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                            ]}
                            placeholder="Nhập name"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSwitch
                            label="Trạng thái"
                            name="active"
                            checkedChildren="ACTIVE"
                            unCheckedChildren="INACTIVE"
                            initialValue={true}
                            fieldProps={{
                                defaultChecked: true,
                            }}
                        />
                    </Col>

                    <Col span={24}>
                        <ProFormTextArea
                            label="Miêu tả"
                            name="description"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập miêu tả role"
                            fieldProps={{
                                autoSize: { minRows: 2 }
                            }}
                        />
                    </Col>
                    <Col span={24}>
                        <ProCard
                            title="Quyền hạn"
                            subTitle="Các quyền hạn được phép cho vai trò này"
                            headStyle={{ color: '#d81921' }}
                            style={{ marginBottom: 20 }}
                            headerBordered
                            size="small"
                            bordered
                        >
                            <ModuleApi
                                form={form}
                                listPermissions={listPermissions}
                                singleRole={singleRole}
                                openModal={openModal}
                            />

                        </ProCard>

                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalRole;
