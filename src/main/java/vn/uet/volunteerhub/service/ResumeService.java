package vn.uet.volunteerhub.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.turkraft.springfilter.converter.FilterSpecification;
import com.turkraft.springfilter.converter.FilterSpecificationConverter;
import com.turkraft.springfilter.parser.FilterParser;
import com.turkraft.springfilter.parser.node.FilterNode;

import vn.uet.volunteerhub.domain.Job;
import vn.uet.volunteerhub.domain.Notification;
import vn.uet.volunteerhub.domain.Resume;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.notification.ResumeStatusNotification;
import vn.uet.volunteerhub.domain.response.Meta;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.domain.response.resume.ResCreateResumeDTO;
import vn.uet.volunteerhub.domain.response.resume.ResFetchResumeDTO;
import vn.uet.volunteerhub.domain.response.resume.ResUpdateResumeDTO;
import vn.uet.volunteerhub.repository.JobRepository;
import vn.uet.volunteerhub.repository.ResumeRepository;
import vn.uet.volunteerhub.repository.UserRepository;
import vn.uet.volunteerhub.util.SecurityUtil;

@Service
public class ResumeService {
    @Autowired
    private FilterParser filterParser;

    @Autowired
    private FilterSpecificationConverter filterSpecificationConverter;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository,
            JobRepository jobRepository, SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
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

        this.publishStatusNotification(currentResume);

        // convert Resume Object into DTO
        ResUpdateResumeDTO dto = new ResUpdateResumeDTO();
        dto.setUpdatedAt(currentResume.getUpdatedAt());
        dto.setUpdatedBy(currentResume.getUpdatedBy());

        return dto;
    }

    private void publishStatusNotification(Resume resume) {
        if (resume.getUser() == null || resume.getUser().getEmail() == null) {
            return;
        }

        String jobName = resume.getJob() != null ? resume.getJob().getName() : null;
        String eventName = (resume.getJob() != null && resume.getJob().getEvent() != null)
                ? resume.getJob().getEvent().getName()
                : null;
        String status = String.valueOf(resume.getStatus());

        String message = String.format("Hồ sơ của bạn đã được cập nhật sang trạng thái %s", status);

        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setReceiverEmail(resume.getUser().getEmail());
        notification.setJobName(jobName);
        notification.setStatus(status);

        Notification savedNotification = this.notificationService.save(notification);

        Instant createdAt = savedNotification.getCreatedAt() != null ? savedNotification.getCreatedAt() : Instant.now();

        ResumeStatusNotification payload = ResumeStatusNotification.builder()
            .notificationId(savedNotification.getId())
            .resumeId(resume.getId())
            .status(status)
            .email(savedNotification.getReceiverEmail())
            .jobName(jobName)
            .eventName(eventName)
            .message(message)
            .timestamp(createdAt)
            .isRead(savedNotification.isRead())
            .build();

        String destination = String.format("/user/%s/queue/notifications", resume.getUser().getEmail());
        this.messagingTemplate.convertAndSend(destination, payload);
    }

    public void deleteResume(long id) {
        this.resumeRepository.deleteById(id);
    }

    public ResFetchResumeDTO convertToResFetchResumeDTO(Resume resume) {
        ResFetchResumeDTO dto = new ResFetchResumeDTO();
        dto.setId(resume.getId());
        dto.setEmail(resume.getEmail());
        dto.setUrl(resume.getUrl());
        dto.setStatus(resume.getStatus());
        dto.setCreatedAt(resume.getCreatedAt());
        dto.setCreatedBy(resume.getCreatedBy());
        dto.setUpdatedAt(resume.getUpdatedAt());
        dto.setUpdatedBy(resume.getUpdatedBy());

        if (resume.getJob() != null && resume.getJob().getEvent() != null) {
            dto.setEventName(resume.getJob().getEvent().getName());
        }

        ResFetchResumeDTO.UserResume user = new ResFetchResumeDTO.UserResume(
                resume.getUser().getId(),
                resume.getUser().getName());
        dto.setUser(user);
        
        ResFetchResumeDTO.JobResume job = new ResFetchResumeDTO.JobResume(
                resume.getJob().getId(),
                resume.getJob().getName(),
                resume.getJob().getEvent().getId());
        dto.setJob(job);

        return dto;
    }


    public ResultPaginationDTO fetchAllResumes(Specification<Resume> spec, Pageable pageable) {
        Page<Resume> pageResume = this.resumeRepository.findAll(spec, pageable);

        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());

        meta.setPages(pageResume.getTotalPages());
        meta.setTotal(pageResume.getTotalElements());

        result.setMeta(meta);

        // convert Resume Objct into DTO
        List<ResFetchResumeDTO> listResume = pageResume.getContent()
                .stream().map(this::convertToResFetchResumeDTO)
                .collect(Collectors.toList());

        result.setResult(listResume);

        return result;
    }

    public ResultPaginationDTO fetchResumesByUser(Pageable pageable) {
        // query builder
        String email = SecurityUtil.getCurrentUserLogin().isPresent() == true ? SecurityUtil.getCurrentUserLogin().get()
                : "";

        FilterNode node = filterParser.parse("email='" + email + "'");
        FilterSpecification<Resume> spec = filterSpecificationConverter.convert(node);
        Page<Resume> pageResume = this.resumeRepository.findAll(spec, pageable);

        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());

        meta.setPages(pageResume.getTotalPages());
        meta.setTotal(pageResume.getTotalElements());

        result.setMeta(meta);

        // convert Resume Object into ResFetchResumeDTO
        List<ResFetchResumeDTO> listResume = pageResume.getContent()
                .stream().map(item -> this.convertToResFetchResumeDTO(item))
                .collect(Collectors.toList());

        result.setResult(listResume);

        return result;
        // filter: https://github.com/turkraft/springfilter/issues/363
        // https://github.com/turkraft/springfilter/issues/233#issuecomment-1590045915
    }
}