import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import EventCard from '@/components/client/card/event.card';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <div className="search-content" style={{ marginTop: 40 }}>
                <SearchClient />
            </div>
            <Divider />
            <EventCard />
            <div style={{ margin: 50 }}></div>
            <Divider />
            <JobCard />
        </div>
    )
}

export default HomePage;