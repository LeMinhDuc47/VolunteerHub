import ModalEvent from "@/components/admin/event/modal.event";
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEvent } from "@/redux/slice/eventSlide";
import { IEvent } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteEvent } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";

const EventPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IEvent | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.event.isFetching);
    const meta = useAppSelector(state => state.event.meta);
    const events = useAppSelector(state => state.event.result);
    const dispatch = useAppDispatch();

    const handleDeleteEvent = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteEvent(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa Event thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IEvent>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
        },

        {
            title: 'CreatedAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'UpdatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    < Access
                        permission={ALL_PERMISSIONS.EVENTS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >
                    <Access
                        permission={ALL_PERMISSIONS.EVENTS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa event"}
                            description={"Bạn có chắc chắn muốn xóa event này ?"}
                            onConfirm={() => handleDeleteEvent(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.address) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("address", clone.address)}`
                : `${sfLike("address", clone.address)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.address) {
            sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
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
                padding: 0 !important;
            }

            .ant-pro-table-search .ant-form-item-label > label {
                font-weight: 500 !important;  
                color: rgba(0, 0, 0, 0.88) !important;
                margin-left: 0 !important;
                display: flex !important;
                align-items: center !important;
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
            <Access
                permission={ALL_PERMISSIONS.EVENTS.GET_PAGINATE}
            >
                <DataTable<IEvent>
                    actionRef={tableRef}
                    headerTitle="Danh sách Sự kiện"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={events}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchEvent({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Access
                                permission={ALL_PERMISSIONS.EVENTS.CREATE}
                                hideChildren
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                            </Access>
                        );
                    }}
                />
            </Access>
            <ModalEvent
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div >
    )
}

export default EventPage;