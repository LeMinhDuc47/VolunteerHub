package vn.uet.volunteerhub.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Getter;
import lombok.Setter;
import vn.uet.volunteerhub.domain.Notification;
import vn.uet.volunteerhub.service.NotificationService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @ApiMessage("Fetch notifications of current user")
    public ResponseEntity<List<Notification>> fetchNotifications() {
        List<Notification> notifications = this.notificationService.fetchRecentForCurrentUser();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/read")
    @ApiMessage("Mark notifications as read")
    public ResponseEntity<Void> markAsRead(@RequestBody(required = false) MarkAsReadRequest request) {
        Long notificationId = request != null ? request.getNotificationId() : null;
        this.notificationService.markNotificationsAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @Getter
    @Setter
    public static class MarkAsReadRequest {
        private Long notificationId;
    }
}
