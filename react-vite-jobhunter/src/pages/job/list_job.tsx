import JobCard from "@/components/client/card/job.card";
import "@/styles/pages/job_detail_style.css";

const ClientJobListPage = () => {
    return (
        <div className="job-detail-container">
            <div className="job-wrapper">
                <JobCard showPagination={true} />
            </div>
        </div>
    );
};

export default ClientJobListPage;