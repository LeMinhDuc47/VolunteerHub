package vn.uet.volunteerhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import vn.uet.volunteerhub.domain.Resume;
import vn.uet.volunteerhub.util.constant.ResumeStateEnum;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>, JpaSpecificationExecutor<Resume> {
    boolean existsByUserIdAndJobEventIdAndStatus(long userId, long eventId, ResumeStateEnum status);
}
