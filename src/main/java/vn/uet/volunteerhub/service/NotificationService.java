package vn.uet.volunteerhub.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import vn.uet.volunteerhub.domain.Notification;
import vn.uet.volunteerhub.repository.NotificationRepository;
import vn.uet.volunteerhub.util.SecurityUtil;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification save(Notification notification) {
        return this.notificationRepository.save(notification);
    }

    public List<Notification> fetchRecentForCurrentUser() {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (!StringUtils.hasText(email)) {
            return Collections.emptyList();
        }
        return this.notificationRepository.findTop20ByReceiverEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void markNotificationsAsRead(Long notificationId) {
        String email = SecurityUtil.getCurrentUserLogin().orElse("");
        if (!StringUtils.hasText(email)) {
            return;
        }

        if (notificationId != null) {
            this.notificationRepository.findByIdAndReceiverEmail(notificationId, email)
                    .ifPresent(notification -> {
                        if (!notification.isRead()) {
                            notification.setRead(true);
                            this.notificationRepository.save(notification);
                        }
                    });
            return;
        }

        this.notificationRepository.markAllAsRead(email);
    }
}
