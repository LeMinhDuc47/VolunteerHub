import { callFetchJob } from '@/config/api';
import { getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sfIn, sfGe, sfLe, sfAnd } from "spring-filter-query-builder";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '@/styles/client/job_card_style.css';

dayjs.extend(relativeTime);

interface IProps {
  showPagination?: boolean;
}

export interface JobCardItemProps {
  job: IJob;
  onClick?: (job: IJob) => void;
  topRight?: ReactNode;        // ví dụ Tag trạng thái
  showDateRange?: boolean;     // hiển thị start - end
  footer?: ReactNode;          // footer custom (buttons, join date...)
  className?: string;
}

export const JobCardItem = ({
  job,
  onClick,
  topRight,
  showDateRange = false,
  footer,
  className,
}: JobCardItemProps) => {
  const displayDate = (d?: string) => (d ? dayjs(d).format('DD/MM/YYYY') : 'N/A');

  const handleCardClick = () => {
    onClick?.(job);
  };

  return (
    <Card
      className={`custom-job-card ${className ?? ''}`}
      hoverable
      bordered={false}
      onClick={handleCardClick}
    >
      <div className="job-card-inner">
        <div className="job-card-left">
          <img
            alt={job.name}
            src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${job?.event?.logo}`}
            onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Logo"; }}
          />
        </div>

        <div className="job-card-right">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div className="job-title" title={job.name}>{job.name}</div>
              <div onClick={(e) => e.stopPropagation()}>
                {topRight}
              </div>
            </div>

            <div className="job-meta-row">
              <EnvironmentOutlined className="job-meta-icon" style={{ color: '#58aaab' }} />
              <span className="location-text">{getLocationName(job.location)}</span>
            </div>

            <div className="job-meta-row">
              <span className="salary-label" style={{ fontWeight: 600, color: '#555' }}>Trợ cấp:</span>&nbsp;
              <span className="salary-text" style={{ color: '#e69500', fontWeight: 600 }}>
                {(job.stipend + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
              </span>
            </div>

            {showDateRange && (
              <div className="job-meta-row">
                <CalendarOutlined className="job-meta-icon" style={{ color: '#58aaab' }} />
                <span>
                  {displayDate(job.startDate)} - {displayDate(job.endDate)}
                </span>
              </div>
            )}
          </div>

          <div className="time-text">
            <ClockCircleOutlined style={{ marginRight: 5 }} />
            {job.updatedAt
              ? dayjs(job.updatedAt).locale('en').fromNow()
              : dayjs(job.createdAt).locale('en').fromNow()}
          </div>
        </div>
      </div>

      {footer && (
        <div
          style={{ marginTop: 10 }}
          onClick={(e) => e.stopPropagation()} // footer bấm không trigger navigate card
        >
          {footer}
        </div>
      )}
    </Card>
  );
};

const JobCard = (props: IProps) => {
  const { showPagination = false } = props;

  const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize, sortQuery, searchParams]);

  const fetchJob = async () => {
    setIsLoading(true);
    let query = `page=${current}&size=${pageSize}`;
    if (sortQuery) query += `&${sortQuery}`;

    const queryLocation = searchParams.get("location");
    const querySkills = searchParams.get("skills");
    const queryEvent = searchParams.get("event");
    const keyword = searchParams.get("keyword");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (queryLocation || querySkills || queryEvent || keyword || (from && to)) {
      const parts: string[] = [];

      if (queryLocation) parts.push(sfIn("location", queryLocation.split(",")).toString());
      if (querySkills) parts.push(sfIn("skills", querySkills.split(",")).toString());
      if (queryEvent) parts.push(`event.id:${queryEvent}`);

      if (keyword && keyword.trim()) {
        const k = keyword.trim().replace(/'/g, "''");
        parts.push(`(name ~ '${k}' or event.name ~ '${k}')`);
      }

      if (from && to) {
        const dFrom = dayjs(from);
        const dTo = dayjs(to);

        if (dFrom.isValid() && dTo.isValid()) {
          const fromISO = dFrom.startOf('day').toISOString();
          const toISO = dTo.endOf('day').toISOString();

          const dateFilter = sfAnd([
            sfLe("event.startDate", toISO),
            sfGe("event.endDate", fromISO)
          ]).toString();

          parts.push(dateFilter);
        }
      }

      if (parts.length > 0) {
        const q = parts.join(" and ");
        query += `&filter=${encodeURIComponent(q)}`;
      }
    }

    const res = await callFetchJob(query);
    if (res && res.data) {
      setDisplayJob(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
    if (pagination && pagination.current !== current) setCurrent(pagination.current);
    if (pagination && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1);
    }
  };

  const handleViewDetailJob = (item: IJob) => {
    if (item.id) navigate(`/home/job/${item.id}?id=${item.id}`);
  };

  return (
    <div className="job-card-section">
      <div className="job-card-container">
        <Spin spinning={isLoading} tip="Loading...">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <div className="job-card-header">
                <span className="job-card-title">
                  {searchParams.get("event") ? "Hoạt động thuộc sự kiện" : "Hoạt động mới nhất"}
                </span>
                {!showPagination && (
                  <Link to="job" className="job-view-all">Xem tất cả &rarr;</Link>
                )}
              </div>
            </Col>

            {displayJob?.map(item => (
              <Col span={24} md={12} key={item.id}>
                <JobCardItem
                  job={item}
                  onClick={handleViewDetailJob}
                />
              </Col>
            ))}

            {(!displayJob || displayJob.length === 0) && !isLoading && (
              <div className="job-empty">
                <Empty description="Không tìm thấy hoạt động nào phù hợp" />
              </div>
            )}
          </Row>

          {showPagination && (
            <>
              <div style={{ marginTop: 40 }} />
              <Row style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  current={current}
                  total={total}
                  pageSize={pageSize}
                  responsive
                  onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                />
              </Row>
            </>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default JobCard;
