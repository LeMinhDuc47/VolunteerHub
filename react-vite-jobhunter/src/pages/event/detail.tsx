import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IEvent } from "@/types/backend";
import { callFetchEventById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";


const ClientEventDetailPage = (props: any) => {
    const [eventDetail, setEventDetail] = useState<IEvent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchEventById(id);
                if (res?.data) {
                    setEventDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {eventDetail && eventDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {eventDetail.name}
                                </div>

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{(eventDetail?.address)}
                                </div>

                                <Divider />
                                {parse(eventDetail?.description ?? "")}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["event"]}>
                                    <div>
                                        <img
                                            width={200}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${eventDetail?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {eventDetail?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientEventDetailPage;