import { Divider } from 'antd';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import EventCard from '@/components/client/card/event.card';
import '@/styles/pages/home_page_style.css';

const HomePage = () => {
    return (
        <div className="main-content-container">
            <div className="home-search-section" style={{ marginTop: 40 }}>
                <SearchClient />
            </div>
            
            <Divider className="home-section-divider" />
            
            <div className="home-events-section">
                <EventCard />
            </div>
            
            <Divider className="home-section-divider" />
            
            <div className="home-jobs-section">
                <JobCard />
            </div>
        </div>
    )
}

export default HomePage;