import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUser } from "@/redux/slice/userSlide";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, ExportOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteUser, callFetchEvent, callFetchUser } from "@/config/api";
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import { DebounceSelect } from "@/components/admin/user/debouce.select";
import * as XLSX from 'xlsx';

interface IEventSelect {
    label: string;
    value: string;
    key?: string;
}

const UserPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();
    
    // 1. Dùng Ref này để lưu lại các tham số tìm kiếm mỗi khi người dùng nhấn Search
    const lastSearchParams = useRef<any>({}); 

    const isFetching = useAppSelector(state => state.user.isFetching);
    const meta = useAppSelector(state => state.user.meta);
    const users = useAppSelector(state => state.user.result);
    const dispatch = useAppDispatch();

    const handleDeleteUser = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteUser(id);
            if (+res.statusCode === 200) {
                message.success('Xóa User thành công');
                reloadTable();
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res.message });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    async function fetchEventList(name: string): Promise<IEventSelect[]> {
        const res = await callFetchEvent(`page=1&size=100&name~'${name}'`);
        if (res && res.data) {
            const list = res.data.result || [];
            return list.map((item: any) => ({
                label: item.name as string,
                value: item.id as string,
                key: item.id as string,
            }));
        }
        return [];
    }

    const columns: ProColumns<IUser>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => (<>{(index + 1) + (meta.page - 1) * (meta.pageSize)}</>),
            hideInSearch: true,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
        },
        {
            title: 'Role',
            dataIndex: ["role", "name"],
            sorter: true,
            hideInSearch: true
        },
        {
            title: 'Event',
            key: 'event', // <--- Key này QUAN TRỌNG để form nhận diện
            dataIndex: ["event", "name"],
            sorter: true,
            hideInSearch: false,
            renderFormItem: (item, props, form) => {
                return (
                    <DebounceSelect
                        allowClear
                        showSearch
                        placeholder="Chọn sự kiện"
                        fetchOptions={fetchEventList}
                        {...props}
                        style={{ width: '100%' }}
                    />
                )
            }
        },
        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index) => (<>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>),
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index) => (<>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>),
            hideInSearch: true,
        },
        {
            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 20, color: '#ffa500' }}
                            onClick={() => { setOpenModal(true); setDataInit(entity); }}
                        />
                    </Access>
                    <Access permission={ALL_PERMISSIONS.USERS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        const clone = { ...params };
        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.email) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("email", clone.email)}`
                : `${sfLike("email", clone.email)}`;
        }
        
        // Lấy giá trị Event (hỗ trợ cả object từ DebounceSelect)
        const eventValue = clone.event?.value || clone["event.name"]?.value;
        if (eventValue) {
            q.filter = q.filter
                ? `${q.filter} and event.id:${eventValue}`
                : `event.id:${eventValue}`;
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        if (sort && sort.email) sortBy = sort.email === 'ascend' ? "sort=email,asc" : "sort=email,desc";
        if (sort && sort.createdAt) sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        if (sort && sort.updatedAt) sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }
        return temp;
    }

    const handleExportData = async () => {
        try {
            // 2. Sử dụng params đã lưu từ lần search cuối cùng
            const currentParams = lastSearchParams.current || {};
            
            const params: any = {
                ...currentParams,
                current: 1,
                pageSize: 1000, // Lấy nhiều dữ liệu để export
            };
            
            const query = buildQuery(params, {}, {});
            const res = await callFetchUser(query);
            
            if (res && res.data) {
                const list: IUser[] = res.data.result || [];
                
                // 3. Map dữ liệu
                const rows = list.map(u => ({
                    "ID": u.id,
                    "Tên hiển thị": u.name,
                    "Email": u.email,
                    "Tên Sự Kiện": u.event?.name || "",
                    "Vai trò": u.role?.name || "",
                    "Ngày tạo": u.createdAt ? dayjs(u.createdAt).format('DD-MM-YYYY HH:mm:ss') : "",
                }));

                // 4. Ép buộc thứ tự cột bằng Header
                const header = ["ID", "Tên hiển thị", "Email", "Tên Sự Kiện", "Vai trò", "Ngày tạo"];

                const worksheet = XLSX.utils.json_to_sheet(rows, { header });
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
                XLSX.writeFile(workbook, 'Danh_Sach_Tinh_Nguyen_Vien.xlsx');
                message.success('Xuất dữ liệu thành công');
            } else {
                notification.error({ message: 'Có lỗi xảy ra', description: res?.message });
            }
        } catch (e: any) {
            notification.error({ message: 'Có lỗi xảy ra', description: e?.message });
        }
    }

    return (
        <div>
            <style>
            {`
            .ant-pro-table-search .ant-form-item,
            .ant-pro-table-search .ant-form-item-control,
            .ant-pro-table-search .ant-form-item-control-input,
            .ant-pro-table-search .ant-form-item-control-input-content {
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            .ant-pro-table-search .ant-input-affix-wrapper {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                background: transparent !important;
                height: auto !important;
            }

            .ant-pro-table-search input.ant-input {
                height: 40px !important;
                border: 1px solid #d9d9d9 !important;
                border-radius: 6px !important;
                padding: 0 12px !important;
                font-size: 14px !important;
                width: 100% !important;
            }

            .ant-pro-table-search input.ant-input:hover {
                border-color: #1a73e8 !important;
            }

            .ant-pro-table-search input.ant-input:focus {
                border-color: #1a73e8 !important;
                box-shadow: 0 0 0 2px rgba(26,115,232,0.15) !important;
            }
            
            .ant-pro-table-search input.ant-input {
                height: 40px !important;
                line-height: 40px !important;
                padding: 0 12px !important;
            }

            .ant-pro-table-search .ant-select-selector {
                height: 40px !important;
                display: flex !important;
                align-items: center !important;
            }

            .ant-pro-table-search .ant-form-item-label > label {
                height: 40px !important;
                display: flex !important;
                align-items: center !important;
                padding: 0 20px !important;
            }

            .ant-pro-table-search .ant-form-item-label > label {
                font-weight: 500 !important;  
                color: rgba(0, 0, 0, 0.88) !important;
                margin-left: 0px;
            }

            .ant-pro-table-search .ant-btn {
                height: 40px !important;
                padding: 0 20px !important;
                border-radius: 6px !important;
                font-size: 14px !important;
                display: flex !important;
                align-items: center !important;
            }

            .ant-pro-table-search .ant-space-item {
                display: flex !important;
                align-items: center !important;
            }
            `}
            </style>
            <Access permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}>
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách Users"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={users}
                    request={async (params, sort, filter): Promise<any> => {
                        // 5. LƯU LẠI PARAMS TÌM KIẾM MỖI KHI BẢNG RELOAD
                        lastSearchParams.current = params;
                        
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchUser({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => (<div> {range[0]}-{range[1]} trên {total} rows</div>)
                    }}
                    rowSelection={false}
                    toolBarRender={() => [
                        <Space key="buttons">
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={() => setOpenModal(true)}
                            >
                                Thêm mới
                            </Button>
                            <Button
                                icon={<ExportOutlined />}
                                onClick={handleExportData}
                            >
                                Export Excel
                            </Button>
                        </Space>
                    ]}
                />
            </Access>
            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default UserPage;