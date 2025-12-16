package vn.uet.volunteerhub.domain.notification;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeStatusNotification {
    private Long resumeId;
    private String status;
    private String email;
    private String jobName;
    private String eventName;
    private String message;
    private Instant timestamp;
}
