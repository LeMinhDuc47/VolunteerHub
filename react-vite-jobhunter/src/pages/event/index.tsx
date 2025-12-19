import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import EventCard from '@/components/client/card/event.card';

const ClientEventPage = () => {
    return (
        <div className="main-content-container">
            <div style={{ marginTop: 40, marginBottom: 40 }}>
                <EventCard showPagination={true} />
            </div>
        </div>
    )
}

export default ClientEventPage;