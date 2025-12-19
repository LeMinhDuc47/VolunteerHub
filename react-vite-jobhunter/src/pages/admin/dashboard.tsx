import { Card, Col, Row, Statistic, Spin } from "antd";
import { UserOutlined, CalendarOutlined, ShopOutlined } from "@ant-design/icons";
import CountUp from 'react-countup';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { callFetchUser, callFetchEvent, callFetchJob } from '@/config/api';
import DashboardChart from "@/components/admin/dashboard/chart";
import 'styles/pages/admin/dashboard_style.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [userCount, setUserCount] = useState<number>(0);
    const [eventCount, setEventCount] = useState<number>(0);
    const [jobCount, setJobCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const userRes = await callFetchUser('current=1&pageSize=1');
                const eventRes = await callFetchEvent('current=1&pageSize=1');
                const jobRes = await callFetchJob('current=1&pageSize=1');

                setUserCount(userRes.data?.meta?.total || 0);
                setEventCount(eventRes.data?.meta?.total || 0);
                setJobCount(jobRes.data?.meta?.total || 0);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setUserCount(0);
                setEventCount(0);
                setJobCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <Spin spinning={loading}>
            <div className="dashboard-container">
                <Row gutter={[24, 24]}>
                    <Col span={24} sm={24} md={12} lg={8}>
                        <Card
                            bordered={false}
                            className="dashboard-card card-user"
                            bodyStyle={{ padding: '32px 24px' }}
                            onClick={() => navigate('/admin/user')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-content">
                                <div className="card-icon user-icon">
                                    <UserOutlined />
                                </div>
                                <div className="card-info">
                                    <h3 className="card-title">Users</h3>
                                    <Statistic
                                        value={userCount}
                                        formatter={formatter}
                                        className="card-stat"
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={24} sm={24} md={12} lg={8}>
                        <Card
                            bordered={false}
                            className="dashboard-card card-event"
                            bodyStyle={{ padding: '32px 24px' }}
                            onClick={() => navigate('/admin/event')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-content">
                                <div className="card-icon event-icon">
                                    <CalendarOutlined />
                                </div>
                                <div className="card-info">
                                    <h3 className="card-title">Events</h3>
                                    <Statistic
                                        value={eventCount}
                                        formatter={formatter}
                                        className="card-stat"
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={24} sm={24} md={12} lg={8}>
                        <Card
                            bordered={false}
                            className="dashboard-card card-job"
                            bodyStyle={{ padding: '32px 24px' }}
                            onClick={() => navigate('/admin/job')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-content">
                                <div className="card-icon job-icon">
                                    <ShopOutlined />
                                </div>
                                <div className="card-info">
                                    <h3 className="card-title">Jobs</h3>
                                    <Statistic
                                        value={jobCount}
                                        formatter={formatter}
                                        className="card-stat"
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card
                            bordered={false}
                            className="dashboard-card"
                            bodyStyle={{ padding: '32px 24px' }}
                        >
                            <DashboardChart />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    )
}

export default DashboardPage;