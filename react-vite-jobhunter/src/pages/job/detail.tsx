import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callFetchJobById } from "@/config/api";
import "@/styles/pages/job_detail_style.css";
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined } from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";

dayjs.extend(relativeTime);

const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const { id } = useParams<{ id: string }>();
    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const queryId = params?.get("id");

    useEffect(() => {
        const init = async () => {
            const jobId = id || queryId;
            if (jobId) {
                setIsLoading(true);
                const res = await callFetchJobById(jobId);
                if (res?.data) {
                    setJobDetail(res.data);
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id, queryId]);

    return (
        <div className="job-detail-container">
            <div className="job-wrapper">
                {isLoading ? (
                    <Skeleton active />
                ) : (
                    <Row gutter={[24, 24]}>
                        {jobDetail && jobDetail.id && (
                            <>
                                <Col span={24} md={16}>
                                    <div className="job-main-card">
                                        <div className="header-title">
                                            {jobDetail.name}
                                        </div>

                                        <div className="job-meta-section">
                                            <div className="meta-item salary">
                                                <DollarOutlined />
                                                <span>
                                                    {(jobDetail.stipend + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <EnvironmentOutlined />
                                                <span>{getLocationName(jobDetail.location)}</span>
                                            </div>
                                            <div className="meta-item">
                                                <HistoryOutlined />
                                                <span>
                                                    {jobDetail.updatedAt
                                                        ? dayjs(jobDetail.updatedAt).locale("en").fromNow()
                                                        : dayjs(jobDetail.createdAt).locale("en").fromNow()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="job-skills">
                                            {jobDetail?.skills?.map((item, index) => (
                                                <Tag
                                                key={`${index}-key`}
                                                className="job-skill-tag"
                                                >
                                                {item.name}
                                                </Tag>
                                            ))}
                                        </div>

                                        <div className="btn-apply-container">
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn-apply"
                                            >
                                                Apply Now
                                            </button>
                                        </div>

                                        <Divider style={{ margin: '24px 0' }} />

                                        <div className="job-description">
                                            {parse(jobDetail.description)}
                                        </div>
                                    </div>
                                </Col>

                                <Col span={24} md={8}>
                                    <div className="company-card">
                                        <div className="company-logo-wrapper">
                                            <img
                                                alt="company-logo"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${jobDetail.event?.logo}`}
                                            />
                                        </div>
                                        <div className="company-name">
                                            {jobDetail.event?.name}
                                        </div>
                                    </div>
                                </Col>
                            </>
                        )}
                    </Row>
                )}
            </div>

            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    );
};

export default ClientJobDetailPage;
