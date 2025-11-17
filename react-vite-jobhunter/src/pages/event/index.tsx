import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import EventCard from '@/components/client/card/event.card';

const ClientEventPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <EventCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientEventPage;