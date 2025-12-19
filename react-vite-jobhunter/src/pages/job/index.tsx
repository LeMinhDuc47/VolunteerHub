import SearchClient from '@/components/client/search.client';
import { Col, Divider, Row } from 'antd';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';

const ClientJobPage = () => {
    return (
        <div className="main-content-container"> 
            <div style={{ marginTop: 40 }}>
                <SearchClient />
            </div>
            <Divider />
            <div style={{ marginBottom: 40 }}>
                <JobCard showPagination={true} />
            </div>
        </div>
    )
}

export default ClientJobPage;