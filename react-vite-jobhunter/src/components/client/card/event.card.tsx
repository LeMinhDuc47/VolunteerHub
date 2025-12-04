import { callFetchEvent } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { IEvent } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@/styles/client/event_card_style.css';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';

interface IProps {
    showPagination?: boolean;
    pageSize?: number;
}

const EventCard = (props: IProps) => {
    const { showPagination = false, pageSize: customPageSize = 4 } = props;

    const [displayEvent, setDisplayEvent] = useState<IEvent[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(showPagination ? 8 : customPageSize);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvent();
    }, [current, pageSize, filter, sortQuery]);

    const fetchEvent = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        const res = await callFetchEvent(query);
        if (res && res.data) {
            setDisplayEvent(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false)
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

    const handleViewDetailJob = (item: IEvent) => {
        if (item.id) {
            navigate(`/home/event/${item.id}?id=${item.id}`)
        }
    }

    const getEventStatus = (endDate?: string) => {
        if (!endDate) return "Đang diễn ra";
        const now = dayjs();
        const end = dayjs(endDate);
        return end.isBefore(now) ? "Đã kết thúc" : "Đang diễn ra";
    }

    const getStatusClass = (endDate?: string) => {
        return getEventStatus(endDate) === "Đã kết thúc" ? "event-status-ended" : "event-status";
    }

    const getDisplayDate = (date?: string) => {
        if (date) return dayjs(date).format('DD/MM/YYYY');
        return 'N/A';
    }

    return (
        <div className="event-card-section">
            <div className="event-card-container">
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[24, 24]}> 
                        <Col span={24}>
                            <div className="event-card-header">
                                <span className="event-card-title">Sự kiện nổi bật</span>
                                {!showPagination &&
                                    <Link to="event" className="event-view-all">Xem tất cả &rarr;</Link>
                                }
                            </div>
                        </Col>

                        {displayEvent?.map(item => {
                            return (
                                <Col span={24} sm={12} md={6} lg={6} key={item.id}>
                                    <Card
                                        onClick={() => handleViewDetailJob(item)}
                                        className="custom-event-card"
                                        hoverable
                                        bordered={false} 
                                        cover={
                                            <div className="event-card-image-wrapper">
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${item?.logo}`}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; 
                                                    }}
                                                />
                                                <div className="event-card-overlay">
                                                    <span className="btn-view-detail">Xem chi tiết</span>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div className="event-card-body">
                                            <h3 className="event-name" title={item.name}>{item.name}</h3>
                                            <div className="event-meta">
                                                <span className={getStatusClass(item.endDate)}>{getEventStatus(item.endDate)}</span>
                                                <div className="event-dates">
                                                    <div className="event-date-item">
                                                        <CalendarOutlined className="date-icon" />
                                                        <span className="date-label">Bắt đầu:</span>
                                                        <span className="date-value">{getDisplayDate(item.startDate)}</span>
                                                    </div>
                                                    <div className="event-date-item">
                                                        <CalendarOutlined className="date-icon" />
                                                        <span className="date-label">Kết thúc:</span>
                                                        <span className="date-value">{getDisplayDate(item.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayEvent || displayEvent && displayEvent.length === 0)
                            && !isLoading &&
                            <div className="event-empty">
                                <Empty description="Hiện chưa có sự kiện nào" />
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

export default EventCard;