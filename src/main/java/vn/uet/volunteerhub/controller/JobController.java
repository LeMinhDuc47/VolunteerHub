package vn.uet.volunteerhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Job;
import vn.uet.volunteerhub.domain.response.ResCreateJobDTO;
import vn.uet.volunteerhub.service.JobService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("jobs")
    @ApiMessage("Create a job")
    public ResponseEntity<ResCreateJobDTO> createNewJob(@Valid @RequestBody Job requestJob) {
        ResCreateJobDTO jobCreate = this.jobService.handleCreateJob(requestJob);
        return ResponseEntity.status(HttpStatus.CREATED).body(jobCreate);
    }
}