import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Empty, Spin, Tag, Button, message } from 'antd';
import { callFetchResumeByUser, callFetchJob } from '@/config/api';
import { IJob, IResume } from '@/types/backend';
import dayjs from 'dayjs';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { sfIn } from 'spring-filter-query-builder';

import { JobCardItem } from '@/components/client/card/job.card'; 
import './achievements_style.css';

const HOURS_SAFE_SIZE = 1000;

const AchievementsPage = () => {
  const [listAchievement, setListAchievement] = useState<IResume[]>([]);
  const [jobMap, setJobMap] = useState<Record<string, IJob>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await callFetchResumeByUser();
      const all = (res?.data?.result as IResume[]) ?? [];

      const approvedJobs = all.filter(
        (item) => item.status?.toUpperCase() === 'APPROVED'
      );

      setListAchievement(approvedJobs);

      // fetch full jobs
      const jobIds = Array.from(
        new Set(
          approvedJobs
            .map((r) => r?.job?.id)
            .filter(Boolean)
            .map((id) => String(id))
        )
      );

      if (jobIds.length === 0) {
        setJobMap({});
        setIsLoading(false);
        return;
      }

      // 1 request lấy full job (logo, location, start/end...)
      const filter = sfIn("id", jobIds).toString();
      const jobRes = await callFetchJob(
        `page=1&size=${Math.min(jobIds.length, HOURS_SAFE_SIZE)}&filter=${encodeURIComponent(filter)}`
      );

      const jobs: IJob[] = jobRes?.data?.result ?? [];
      const map: Record<string, IJob> = {};
      for (const j of jobs) {
        if (j?.id != null) map[String(j.id)] = j;
      }
      setJobMap(map);
    } catch (e: any) {
      message.error('Không thể tải thành tích');
      setListAchievement([]);
      setJobMap({});
    } finally {
      setIsLoading(false);
    }
  };

  const getJobStatus = (endDate?: string) => {
    const now = dayjs();
    const end = dayjs(endDate);
    if (end.isValid() && now.isAfter(end)) {
      return { label: 'Đã hoàn thành', color: 'green', icon: <CheckCircleOutlined /> };
    }
    return { label: 'Đang tham gia', color: 'blue', icon: <ClockCircleOutlined /> };
  };

  const achievementsWithJob = useMemo(() => {
    return listAchievement.map((resume) => {
      const id = resume?.job?.id != null ? String(resume.job.id) : '';
      const fullJob = (id && jobMap[id]) ? jobMap[id] : (resume.job as any as IJob);
      return { resume, job: fullJob };
    });
  }, [listAchievement, jobMap]);

  return (
    <div className="achievements-page">
      <div className="main-content-container">
        <Spin spinning={isLoading} tip="Đang tải thành tích...">
          <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
            {achievementsWithJob.length > 0 ? (
              achievementsWithJob.map(({ resume, job }) => {
                const status = getJobStatus(job?.endDate);

                return (
                  <Col xs={24} md={12} key={resume.id}>
                    <JobCardItem
                      job={job}
                      showDateRange
                      topRight={
                        <Tag color={status.color} icon={status.icon} className="achievement-status-tag">
                          {status.label}
                        </Tag>
                      }
                      onClick={() => {
                        if (job?.id) navigate(`/home/job/${job.id}?id=${job.id}`);
                      }}
                      footer={
                        <div className="achievement-footer">
                          <span className="join-date">
                            Đã duyệt từ: {resume.createdAt ? dayjs(resume.createdAt).format('DD/MM/YYYY') : 'N/A'}
                          </span>

                          <div className="achievement-footer-actions">
                            <Button
                              type="link"
                              icon={<ArrowRightOutlined />}
                              onClick={() => {
                                if (job?.id) navigate(`/home/job/${job.id}?id=${job.id}`);
                              }}
                            >
                              Xem chi tiết
                            </Button>

                            <Button
                              type="link"
                              icon={<UnorderedListOutlined />}
                              onClick={() => {
                                // giống y hệt Event detail -> danh sách job theo event
                                if (job?.event?.id) navigate(`/home/job?event=${job.event.id}`);
                              }}
                            >
                              Xem job của sự kiện
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Col>
                );
              })
            ) : (
              !isLoading && (
                <Col span={24}>
                  <Empty
                    description="Bạn chưa có thành tích nào. Hãy tích cực tham gia các hoạt động nhé!"
                    style={{ padding: '100px 0' }}
                  />
                </Col>
              )
            )}
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default AchievementsPage;
