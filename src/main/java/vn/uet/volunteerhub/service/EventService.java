package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.dto.Meta;
import vn.uet.volunteerhub.domain.dto.ResultPaginationDTO;
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

    public ResultPaginationDTO fetchAllEvents(Pageable pageable) {
        Page<Event> pageEvent = this.eventRepository.findAll(pageable);
        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();

        meta.setPage(pageEvent.getNumber());
        meta.setPageSize(pageEvent.getSize());

        meta.setPages(pageEvent.getTotalPages());
        meta.setTotal(pageEvent.getTotalElements());

        result.setMeta(meta);
        result.setResult(pageEvent.getContent());

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

            return this.eventRepository.save(updatedCompany);
        }
        return null;
    }

    public void handleDeleteEvent(long id) {
        this.eventRepository.deleteById(id);
    }
}
