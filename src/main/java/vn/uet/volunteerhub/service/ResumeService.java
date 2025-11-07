package vn.uet.volunteerhub.service;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.repository.ResumeRepository;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }
}