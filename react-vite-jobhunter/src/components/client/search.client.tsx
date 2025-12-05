import { Button, Form, Select, ConfigProvider, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm, ProFormText, ProFormDateRangePicker } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import '@/styles/client/search_style.css';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            const queryKeyword = searchParams.get("keyword");
            const queryFrom = searchParams.get("from");
            const queryTo = searchParams.get("to");

            if (queryLocation) form.setFieldValue("location", queryLocation.split(","));
            if (querySkills) form.setFieldValue("skills", querySkills.split(","));
            if (queryKeyword) form.setFieldValue("keyword", queryKeyword);

            if (queryFrom && queryTo) {
                const d1 = dayjs(queryFrom);
                const d2 = dayjs(queryTo);
                if (d1.isValid() && d2.isValid()) {
                    form.setFieldValue("dateRange", [d1, d2]);
                }
            }
        }
    }, [location.search])

    useEffect(() => {
        fetchSkill();
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
        const queryParts: string[] = [];

        if (values?.location?.length) queryParts.push(`location=${values.location.join(",")}`);
        if (values?.skills?.length) queryParts.push(`skills=${values.skills.join(",")}`);
        if (values?.keyword) queryParts.push(`keyword=${encodeURIComponent(values.keyword)}`);

        if (values?.dateRange?.length === 2) {
            const startDate = dayjs(values.dateRange[0]);
            const endDate = dayjs(values.dateRange[1]);
            if (startDate.isValid() && endDate.isValid()) {
                queryParts.push(`from=${startDate.format('YYYY-MM-DD')}&to=${endDate.format('YYYY-MM-DD')}`);
            }
        }

        const query = queryParts.join('&');
        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng chọn tiêu chí để search'
            });
            return;
        }
        navigate(`/home/job?${query}`);
    }

    return (
        <div className="search-client-wrapper">
            <h2 className="search-client-title">Kết nối Tình nguyện viên - Lan tỏa Yêu thương</h2>
            
            <ConfigProvider locale={viVN}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        render: () => <></>
                    }}
                    className="search-client-form"
                >
                <div className="search-client-row">
                    <div className="search-keyword-wrapper">
                        <ProFormText
                            name="keyword"
                            fieldProps={{
                                allowClear: true,
                                placeholder: 'Từ khóa sự kiện/hoạt động...'
                            }}
                        />
                    </div>
                    <div className="search-input-wrapper">
                        <ProForm.Item name="skills">
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined className="search-placeholder-icon" />
                                        <span>Tìm theo kỹ năng...</span>
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </ProForm.Item>
                    </div>

                    <div className="search-location-wrapper">
                        <ProForm.Item name="location">
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <EnvironmentOutlined className="search-placeholder-icon" />
                                        <span>Địa điểm...</span>
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsLocations}
                            />
                        </ProForm.Item>
                    </div>

                    <div className="search-date-range-wrapper">
                        <ProFormDateRangePicker
                            name="dateRange"
                            placeholder={["Từ ngày", "Đến ngày"]}
                            fieldProps={{
                                style: { width: '100%' },
                                format: 'DD/MM/YYYY',
                            }}
                        />
                    </div>

                    <div className="search-button-wrapper">
                        <Button 
                            type='primary' 
                            onClick={() => form.submit()}
                            className="search-client-button"
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
                </ProForm>
            </ConfigProvider>
        </div>
    )
}

export default SearchClient;