package vn.uet.volunteerhub.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;
import com.turkraft.springfilter.builder.FilterBuilder;
import com.turkraft.springfilter.converter.FilterSpecificationConverter;

import io.micrometer.core.ipc.http.HttpSender.Response;
import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Job;
import vn.uet.volunteerhub.domain.Resume;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.domain.response.resume.ResCreateResumeDTO;
import vn.uet.volunteerhub.domain.response.resume.ResFetchResumeDTO;
import vn.uet.volunteerhub.domain.response.resume.ResUpdateResumeDTO;
import vn.uet.volunteerhub.service.ResumeService;
import vn.uet.volunteerhub.service.UserService;
import vn.uet.volunteerhub.util.SecurityUtil;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserService userService;

    private final FilterBuilder filterBuilder;
    private final FilterSpecificationConverter filterSpecificationConverter;

    public ResumeController(ResumeService resumeService, UserService userService, FilterBuilder filterBuilder,
            FilterSpecificationConverter filterSpecificationConverter) {
        this.resumeService = resumeService;
        this.userService = userService;
        this.filterBuilder = filterBuilder;
        this.filterSpecificationConverter = filterSpecificationConverter;
    }

    @PostMapping("/resumes")
    @ApiMessage("Create a resume")
    public ResponseEntity<ResCreateResumeDTO> createNewResume(@Valid @RequestBody Resume requestResume)
            throws IdInvalidException {
        // check userId and jobId exist
        boolean isIdExist = this.resumeService.checkResumeExistByUserAndJob(requestResume);
        if (!isIdExist) {
            throw new IdInvalidException("User id/Job id not found");
        }
        // create new resume
        ResCreateResumeDTO response = this.resumeService.handleCreateResume(requestResume);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/resumes")
    @ApiMessage("Update status resume")
    public ResponseEntity<ResUpdateResumeDTO> updateStatusResume(@RequestBody Resume requestResume)
            throws IdInvalidException {
        // check resume id
        Optional<Resume> resumeOptional = this.resumeService.fetchResumeById(requestResume.getId());
        if (!resumeOptional.isPresent()) {
            throw new IdInvalidException("Resume with id = " + requestResume.getId() + " not exist");
        }

        ResUpdateResumeDTO response = this.resumeService.updateStatusResume(resumeOptional.get(), requestResume);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @DeleteMapping("/resumes/{id}")
    @ApiMessage("Delete a resume by id")
    public ResponseEntity<Void> deleteResume(@PathVariable("id") long id) throws IdInvalidException {
        // check resume id
        Optional<Resume> resumeOptional = this.resumeService.fetchResumeById(id);
        if (!resumeOptional.isPresent()) {
            throw new IdInvalidException("Resume with id = " + id + " not exist");
        }

        this.resumeService.deleteResume(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/resumes/{id}")
    @ApiMessage("Fetch a resume by id")
    public ResponseEntity<ResFetchResumeDTO> getResumeById(@PathVariable("id") long id) throws IdInvalidException {
        // check resume id
        Optional<Resume> resumeOptional = this.resumeService.fetchResumeById(id);
        if (resumeOptional.isEmpty()) {
            throw new IdInvalidException("Resume with id = " + id + " not exist");
        }

        Resume currentResume = resumeOptional.get();
        ResFetchResumeDTO response = this.resumeService.convertToResFetchResumeDTO(currentResume);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/resumes")
    @ApiMessage("Fetch all resume with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllResumes(@Filter Specification<Resume> spec, Pageable pageable) {
        List<Long> arrJobIds = null;
        String email = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        User currentUser = this.userService.handleGetUserByUsername(email);
        if (currentUser != null) {
            Event userEvent = currentUser.getEvent();
            if (userEvent != null) {
                List<Job> companyJobs = userEvent.getJobs();
                if (companyJobs != null && companyJobs.size() > 0) {
                    arrJobIds = companyJobs.stream().map(x -> x.getId())
                            .collect(Collectors.toList());
                }
            }
        }
        Specification<Resume> jobInSpec = filterSpecificationConverter.convert(filterBuilder.field("job")
                .in(filterBuilder.input(arrJobIds)).get());
        Specification<Resume> finalSpec = jobInSpec.and(spec);

        ResultPaginationDTO listResumes = this.resumeService.fetchAllResumes(finalSpec, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(listResumes);
    }

    @PostMapping("/resumes/by-user")
    @ApiMessage("Get list resumes by user")
    public ResponseEntity<ResultPaginationDTO> fetchResumesByUser(Pageable pageable) {

        ResultPaginationDTO response = this.resumeService.fetchResumesByUser(pageable);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}