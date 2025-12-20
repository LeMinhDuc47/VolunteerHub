package vn.uet.volunteerhub.service;

import java.lang.reflect.Field;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Job;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.dashboard.ResDashboardHourlyPointDTO;

@Service
public class DashboardService {

    @PersistenceContext
    private EntityManager em;

    private static final ZoneId ZONE = ZoneId.of("Asia/Bangkok");
    private static final DateTimeFormatter LABEL_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public List<ResDashboardHourlyPointDTO> getHourlyStats(int hours) {
        int window = clamp(hours, 1, 48);

        ZonedDateTime nowHour = ZonedDateTime.now(ZONE).truncatedTo(ChronoUnit.HOURS);
        ZonedDateTime startHour = nowHour.minusHours(window - 1);

        List<ResDashboardHourlyPointDTO> result = new ArrayList<>(window);

        for (int i = 0; i < window; i++) {
            ZonedDateTime slotStart = startHour.plusHours(i);
            ZonedDateTime slotEnd = slotStart.plusHours(1);

            Instant startInstant = slotStart.toInstant();
            Instant endInstant = slotEnd.toInstant();

            long users = countCreatedBetween(User.class, startInstant, endInstant);
            long events = countCreatedBetween(Event.class, startInstant, endInstant);
            long jobs = countCreatedBetween(Job.class, startInstant, endInstant);

            result.add(new ResDashboardHourlyPointDTO(
                    slotStart.toInstant().toString(),
                    slotStart.format(LABEL_FMT),
                    users, events, jobs
            ));
        }

        return result;
    }

    private <T> long countCreatedBetween(Class<T> entityClass, Instant start, Instant end) {
        String entityName = em.getMetamodel().entity(entityClass).getName();

        Object startParam = toCreatedAtParam(entityClass, start);
        Object endParam = toCreatedAtParam(entityClass, end);

        String jpql = "SELECT COUNT(e) FROM " + entityName + " e " +
                      "WHERE e.createdAt >= :start AND e.createdAt < :end";

        return em.createQuery(jpql, Long.class)
                .setParameter("start", startParam)
                .setParameter("end", endParam)
                .getSingleResult();
    }

    private <T> Object toCreatedAtParam(Class<T> entityClass, Instant instant) {
        Field f = ReflectionUtils.findField(entityClass, "createdAt");
        if (f == null) return instant;

        Class<?> t = f.getType();

        if (Instant.class.equals(t)) return instant;
        if (LocalDateTime.class.equals(t)) return LocalDateTime.ofInstant(instant, ZONE);
        if (OffsetDateTime.class.equals(t)) return OffsetDateTime.ofInstant(instant, ZONE);
        if (Date.class.equals(t)) return Date.from(instant);

        // fallback
        return instant;
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }
}
