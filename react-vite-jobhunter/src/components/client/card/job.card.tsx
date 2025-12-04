import { callFetchJob } from '@/config/api';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { sfIn } from "spring-filter-query-builder";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '@/styles/client/job_card_style.css'; 

dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills")
        const queryEvent = searchParams.get("event");
        if (queryLocation || querySkills || queryEvent) {
            let q = "";
            const parts = [];

            if (queryLocation) parts.push(sfIn("location", queryLocation.split(",")).toString());
            if (querySkills) parts.push(sfIn("skills", querySkills.split(",")).toString());

            if (queryEvent) parts.push(`event.id:${queryEvent}`);

            q = parts.join(" and ");
            query += `&filter=${encodeURIComponent(q)}`;
        }
        const res = await callFetchJob(query);
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        if (item.id) {
            navigate(`/home/job/${item.id}?id=${item.id}`)
        }
    }

    return (
        <div className="job-card-section">
            <div className="job-card-container">
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <div className="job-card-header">
                                <span className="job-card-title">Hoạt động mới nhất</span>
                                {!showPagination &&
                                    <Link to="job" className="job-view-all">Xem tất cả &rarr;</Link>
                                }
                            </div>
                        </Col>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={12} key={item.id}>
                                    <Card 
                                        className="custom-job-card"
                                        hoverable
                                        bordered={false}
                                        onClick={() => handleViewDetailJob(item)}
                                    >
                                        <div className="job-card-inner">
                                            <div className="job-card-left">
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${item?.event?.logo}`}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/100x100?text=Logo";
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="job-card-right">
                                                <div>
                                                    <div className="job-title" title={item.name}>{item.name}</div>
                                                    
                                                    <div className="job-meta-row">
                                                        <EnvironmentOutlined className="job-meta-icon" style={{ color: '#58aaab' }} />
                                                        <span className="location-text">
                                                            {getLocationName(item.location)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="job-meta-row">
                                                        <span className="salary-label" style={{ fontWeight: 600, color: '#555' }}>
                                                            Trợ cấp:
                                                        </span>
                                                        &nbsp;
                                                        <span className="salary-text" style={{ color: '#e69500', fontWeight: 600 }}>
                                                            {(item.stipend + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                        </span>
                                                    </div>

                                                </div>

                                                <div className="time-text">
                                                    <ClockCircleOutlined style={{ marginRight: 5 }} />
                                                    {item.updatedAt 
                                                        ? dayjs(item.updatedAt).locale('en').fromNow() 
                                                        : dayjs(item.createdAt).locale('en').fromNow()
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className="job-empty">
                                <Empty description="Không có hoạt động nào" />
                            </div>
                        }
                    </Row>
                    
                    {showPagination && <>
                        <div style={{ marginTop: 40 }}></div>
                        <Row style={{ display: "flex", justifyContent: "center" }}>
                            <Pagination
                                current={current}
                                total={total}
                                pageSize={pageSize}
                                responsive
                                onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                            />
                        </Row>
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;