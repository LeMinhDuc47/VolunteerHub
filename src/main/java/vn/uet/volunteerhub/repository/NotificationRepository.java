package vn.uet.volunteerhub.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.uet.volunteerhub.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByReceiverEmailOrderByCreatedAtDesc(String receiverEmail);

    Optional<Notification> findByIdAndReceiverEmail(Long id, String receiverEmail);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.receiverEmail = :receiverEmail AND n.isRead = false")
    int markAllAsRead(@Param("receiverEmail") String receiverEmail);
}
