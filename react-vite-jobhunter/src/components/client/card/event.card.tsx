import { callFetchEvent } from '@/config/api';
import { IEvent } from '@/types/backend';
import { Card, Col, Empty, Pagination, Row, Spin, Select } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@/styles/client/event_card_style.css';
import dayjs from 'dayjs';
import { CalendarOutlined, FilterOutlined } from '@ant-design/icons';

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
    
    const [filter, setFilter] = useState("ALL");

    const navigate = useNavigate();

    useEffect(() => {
        fetchEvent();
    }, [current, pageSize, filter]);

    const fetchEvent = async () => {
        setIsLoading(true);
        
        const query = `page=1&size=1000`;
        
        const res = await callFetchEvent(query);
        if (res && res.data) {
            const allEvents = res.data.result;
            const processedEvents = filterAndSortEvents(allEvents);
            
            const startIndex = (current - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedEvents = processedEvents.slice(startIndex, endIndex);
            
            setDisplayEvent(paginatedEvents);
            setTotal(processedEvents.length);
        }
        setIsLoading(false);
    }

    const filterAndSortEvents = (events: IEvent[]) => {
        const now = dayjs();
        
        const happening: IEvent[] = [];
        const upcoming: IEvent[] = [];
        const ended: IEvent[] = [];
        
        events.forEach(event => {
            const startDate = dayjs(event.startDate);
            const endDate = dayjs(event.endDate);
            
            if (startDate.isAfter(now)) {
                upcoming.push(event);
            } else if (endDate.isBefore(now)) {
                ended.push(event);
            } else {
                happening.push(event);
            }
        });
        
        const sortByStartDate = (a: IEvent, b: IEvent) => {
            return dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf();
        };
        
        happening.sort(sortByStartDate);
        upcoming.sort(sortByStartDate);
        ended.sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()); 
        
        let result: IEvent[] = [];
        
        switch (filter) {
            case 'ALL':
                result = [...happening, ...upcoming, ...ended];
                break;
            case 'HAPPENING':
                result = happening;
                break;
            case 'UPCOMING':
                result = upcoming;
                break;
            case 'ENDED':
                result = ended;
                break;
            default:
                result = [...happening, ...upcoming, ...ended];
                break;
        }
        
        return result;
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    }

    const handleSortChange = (value: string) => {
        setCurrent(1);
        setFilter(value);
    };

    const handleViewDetailJob = (item: IEvent) => {
        if (item.id) {
            navigate(`/home/event/${item.id}?id=${item.id}`);
        }
    }

    const getEventStatusData = (start?: string, end?: string) => {
        const now = dayjs();
        const startDate = dayjs(start);
        const endDate = dayjs(end);

        if (startDate.isAfter(now)) {
            return { label: "Sắp diễn ra", class: "event-status-upcoming" }; 
        } else if (endDate.isBefore(now)) {
            return { label: "Đã kết thúc", class: "event-status-ended" };  
        } else {
            return { label: "Đang diễn ra", class: "event-status-active" }; 
        }
    }

    const getDisplayDate = (date?: string) => {
        if (date) return dayjs(date).format('DD/MM/YYYY');
        return 'N/A';
    }

    const sortOptions = [
        { value: 'ALL', label: 'Tất cả' },
        { value: 'HAPPENING', label: 'Đang diễn ra' },
        { value: 'UPCOMING', label: 'Sắp diễn ra' },
        { value: 'ENDED', label: 'Đã kết thúc' },
    ];

    return (
        <div className="event-card-section">
            <div className="event-card-container">
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <div className="event-card-header">
                                <span className="event-card-title">Sự kiện nổi bật</span>
                                
                                {showPagination ? (
                                    <Select
                                        defaultValue="ALL"
                                        style={{ width: 180 }}
                                        onChange={handleSortChange}
                                        options={sortOptions}
                                        className="event-sort-select"
                                        suffixIcon={<FilterOutlined />}
                                    />
                                ) : (
                                    <Link to="event" className="event-view-all">Xem tất cả &rarr;</Link>
                                )}
                            </div>
                        </Col>

                        {displayEvent?.map(item => {
                            const statusData = getEventStatusData(item.startDate, item.endDate);

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

                                                <span className={statusData.class}>{statusData.label}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}

                        {(!displayEvent || displayEvent && displayEvent.length === 0)
                            && !isLoading &&
                            <div className="event-empty">
                                <Empty description="Không tìm thấy sự kiện phù hợp" />
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