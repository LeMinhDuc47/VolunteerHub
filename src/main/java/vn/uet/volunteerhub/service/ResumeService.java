package vn.uet.volunteerhub.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Job;
import vn.uet.volunteerhub.domain.Resume;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.resume.ResCreateResumeDTO;
import vn.uet.volunteerhub.domain.response.resume.ResUpdateResumeDTO;
import vn.uet.volunteerhub.repository.JobRepository;
import vn.uet.volunteerhub.repository.ResumeRepository;
import vn.uet.volunteerhub.repository.UserRepository;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository,
            JobRepository jobRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public Optional<Resume> fetchResumeById(long id) {
        return this.resumeRepository.findById(id);
    }

    public boolean checkResumeExistByUserAndJob(Resume requestResume) {
        // check user by id
        if (requestResume.getUser() == null) {
            return false;
        }
        Optional<User> userOptional = this.userRepository.findById(requestResume.getUser().getId());
        if (!userOptional.isPresent()) {
            return false;
        }

        // check job by id
        if (requestResume.getJob() == null) {
            return false;
        }
        Optional<Job> jobOptional = this.jobRepository.findById(requestResume.getJob().getId());
        if (!jobOptional.isPresent()) {
            return false;
        }

        return true;
    }

    public ResCreateResumeDTO handleCreateResume(Resume requestResume) {
        Resume newResume = this.resumeRepository.save(requestResume);

        ResCreateResumeDTO dto = new ResCreateResumeDTO();
        dto.setId(newResume.getId());
        dto.setCreatedAt(newResume.getCreatedAt());
        dto.setCreatedBy(newResume.getCreatedBy());

        return dto;
    }

    public ResUpdateResumeDTO updateStatusResume(Resume currentResume, Resume requestResume) {
        // set status current resume
        currentResume.setStatus(requestResume.getStatus());

        // update database
        this.resumeRepository.save(currentResume);

        // convert Resume Object into DTO
        ResUpdateResumeDTO dto = new ResUpdateResumeDTO();
        dto.setUpdatedAt(currentResume.getUpdatedAt());
        dto.setUpdatedBy(currentResume.getUpdatedBy());

        return dto;
    }

    public void deleteResume(long id) {
        this.resumeRepository.deleteById(id);
    }
}