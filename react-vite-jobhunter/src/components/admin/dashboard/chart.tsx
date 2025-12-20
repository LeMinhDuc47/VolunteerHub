import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from "recharts";
import { Spin } from "antd";
import { callFetchChartData } from "@/config/api";
import "./chart.css";

interface IChartData {
  name: string;
  users: number;
  events: number;
  jobs: number;
}

const HOURS_WINDOW = 12;
const POLL_MS = 60_000;

const COLORS = {
  users: "#3b82f6", 
  events: "#16a34a", 
  jobs: "#ca8a04",   
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const rows = payload.map((p: any) => (
    <div key={p.dataKey} className="vh-tt-row">
      <span className="vh-tt-dot" style={{ background: p.stroke }} />
      <span className="vh-tt-name">{p.name}</span>
      <span className="vh-tt-val">{p.value}</span>
    </div>
  ));

  return (
    <div className="custom-tooltip">
      <div className="vh-tt-title">Giờ: {label}</div>
      <div className="vh-tt-body">{rows}</div>
    </div>
  );
};

const DashboardChart = () => {
  const [data, setData] = useState<IChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChart = async () => {
    try {
      setLoading(true);
      const res = await callFetchChartData(HOURS_WINDOW);

      const points = res?.data ?? [];
      const mapped: IChartData[] = (points as any[]).map((p) => ({
        name: p.label ?? p.hour ?? "",
        users: Number(p.users ?? 0),
        events: Number(p.events ?? 0),
        jobs: Number(p.jobs ?? 0),
      }));

      setData(mapped);
    } catch (e) {
      console.error("Error fetching chart data:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;

    fetchChart();
    timer = setInterval(() => {
      fetchChart().catch(console.error);
    }, POLL_MS);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const yMax = useMemo(() => {
    let m = 0;
    for (const d of data) {
      m = Math.max(m, d.users, d.events, d.jobs);
    }
    return m + 1;
  }, [data]);

  return (
    <Spin spinning={loading}>
      <div className="vh-chart-wrap">
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={data} margin={{ top: 12, right: 24, left: 6, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.users} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.users} stopOpacity={0} />
              </linearGradient>

              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.events} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.events} stopOpacity={0} />
              </linearGradient>

              <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.jobs} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS.jobs} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tickMargin={8} />
            <YAxis allowDecimals={false} domain={[0, yMax]} />

            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Area
              type="monotone"
              dataKey="users"
              stroke={COLORS.users}
              fill="url(#colorUsers)"
              fillOpacity={1}
              name="Users"
              animationDuration={900}
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke={COLORS.events}
              fill="url(#colorEvents)"
              fillOpacity={1}
              name="Events"
              animationDuration={900}
            />
            <Area
              type="monotone"
              dataKey="jobs"
              stroke={COLORS.jobs}
              fill="url(#colorJobs)"
              fillOpacity={1}
              name="Jobs"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Spin>
  );
};

export default DashboardChart;
