import { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from 'recharts';
import { callFetchChartData } from '@/config/api';
import { Spin } from 'antd';
import './chart.css';

interface IChartData {
    name: string;
    users: number;
    events: number;
    jobs: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Thời gian: ${label}`}</p>
                <p className="intro" style={{ color: payload[0].stroke }}>{`${payload[0].name}: ${payload[0].value}`}</p>
                <p className="intro" style={{ color: payload[1].stroke }}>{`${payload[1].name}: ${payload[1].value}`}</p>
                <p className="intro" style={{ color: payload[2].stroke }}>{`${payload[2].name}: ${payload[2].value}`}</p>
            </div>
        );
    }

    return null;
};

const DashboardChart = () => {
    const [data, setData] = useState<IChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                // @ts-ignore
                const res = await callFetchChartData();
                // @ts-ignore
                setData(res.data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    return (
        <Spin spinning={loading}>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Người dùng" animationDuration={1500}/>
                    <Area type="monotone" dataKey="events" stroke="#16a34a" fillOpacity={1} fill="url(#colorEvents)" name="Sự kiện" animationDuration={1500}/>
                    <Area type="monotone" dataKey="jobs" stroke="#ca8a04" fillOpacity={1} fill="url(#colorJobs)" name="Việc làm" animationDuration={1500}/>
                </AreaChart>
            </ResponsiveContainer>
        </Spin>
    );
}

export default DashboardChart;
