import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import EventCard from '@/components/client/card/event.card';

const ClientEventPage = (props: any) => {
    return (
        <div style={{ marginTop: 20, maxWidth: '1600px', margin: '0 auto', padding: '20px 0;' }}>
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