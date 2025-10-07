package vn.uet.volunteerhub.service;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.repository.EventRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event handleCreateEvent(Event createEvent) {
        return this.eventRepository.save(createEvent);
    }
}
