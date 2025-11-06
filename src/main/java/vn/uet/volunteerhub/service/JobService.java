package vn.uet.volunteerhub.service;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.repository.JobRepository;

@Service
public class JobService {
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }
}