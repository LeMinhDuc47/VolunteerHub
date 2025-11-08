package vn.uet.volunteerhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.uet.volunteerhub.service.EmailService;
import vn.uet.volunteerhub.service.SubscriberService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class EmailController {

    public final EmailService emailService;
    private final SubscriberService subscriberService;

    public EmailController(EmailService emailService, SubscriberService subscriberService) {
        this.emailService = emailService;
        this.subscriberService = subscriberService;
    }

    @GetMapping("/email")
    @ApiMessage("Send email")
    // @Scheduled(cron = "*/30 * * * * *")
    // @Transactional
    public String sendSimpleEmail() {
        this.subscriberService.sendSubscribersEmailJobs();
        return "Send Email Success";
    }
}

// send email use Async
// https://www.danvega.dev/blog/sending-async-emails-in-spring

// Cron job guider: https://spring.io/guides/gs/scheduling-tasks
// Scheduling-cron-expression:
// https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-cron-expression