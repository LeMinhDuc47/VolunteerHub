import { Divider } from 'antd';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import EventCard from '@/components/client/card/event.card';
import '@/styles/pages/home_page_style.css';

const HomePage = () => {
    return (
        <div className="home-page-container">
            <div className="home-search-section">
                <SearchClient />
            </div>
            
            <Divider className="home-section-divider" />
            
            <div className="home-events-section">
                <EventCard />
            </div>
            
            <div className="home-section-spacing"></div>
            
            <Divider className="home-section-divider" />
            
            <div className="home-jobs-section">
                <JobCard />
            </div>
        </div>
    )
}

export default HomePage;