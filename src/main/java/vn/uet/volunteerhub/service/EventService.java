package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.User;
import vn.uet.volunteerhub.domain.response.Meta;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.repository.EventRepository;
import vn.uet.volunteerhub.repository.UserRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Event handleCreateEvent(Event createEvent) {
        return this.eventRepository.save(createEvent);
    }

    public ResultPaginationDTO fetchAllEvents(Specification<Event> spec, Pageable pag) {
        Page<Event> pEvent = this.eventRepository.findAll(spec, pag);
        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();

        meta.setPage(pag.getPageNumber() + 1);
        meta.setPageSize(pag.getPageSize());
        meta.setPages(pEvent.getTotalPages());
        meta.setTotal(pEvent.getTotalElements());
        result.setMeta(meta);
        result.setResult(pEvent.getContent());

        return result;
    }

    public Event handleUpdateEvent(Event requestEvent) {
        Optional<Event> compOptional = this.eventRepository.findById(requestEvent.getId());
        if (compOptional.isPresent()) {

            Event updatedCompany = compOptional.get();
            updatedCompany.setName(requestEvent.getName());
            updatedCompany.setDescription(requestEvent.getDescription());
            updatedCompany.setAddress(requestEvent.getAddress());
            updatedCompany.setLogo(requestEvent.getLogo());
            updatedCompany.setStartDate(requestEvent.getStartDate());
            updatedCompany.setEndDate(requestEvent.getEndDate());

            return this.eventRepository.save(updatedCompany);
        }
        return null;
    }

    public void handleDeleteEvent(long id) {
        Event event = fetchEventById(id);
        if (event != null) {
            // Fetch all user belong to this event
            List<User> users = this.userRepository.findByEvent(event);
            this.userRepository.deleteAll(users);
        }
        this.eventRepository.deleteById(id);
    }

    public Event fetchEventById(long id) {
        Optional<Event> eventOptional = this.eventRepository.findById(id);
        if (eventOptional.isPresent()) {
            return eventOptional.get();
        }
        return null;
    }
}
