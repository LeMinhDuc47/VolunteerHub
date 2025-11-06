package vn.uet.volunteerhub.controller;

import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.response.ResultPaginationDTO;
import vn.uet.volunteerhub.service.EventService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;
import vn.uet.volunteerhub.util.error.IdInvalidException;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@RestController
@RequestMapping("/api/v1")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/events")
    public ResponseEntity<Event> createNewEvent(@Valid @RequestBody Event reqEvent) {
        Event newEvent = this.eventService.handleCreateEvent(reqEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent);
    }

    @GetMapping("/events")
    @ApiMessage("fetch all companies")
    public ResponseEntity<ResultPaginationDTO> getEvents(@Filter Specification<Event> spec, Pageable pageable) {
        ResultPaginationDTO listEvents = this.eventService.fetchAllEvents(spec, pageable);

        return ResponseEntity.status(HttpStatus.OK).body(listEvents);
    }

    @PutMapping("/events")
    public ResponseEntity<Event> updateEvent(@Valid @RequestBody Event requestEvent) {
        Event updatedEvent = this.eventService.handleUpdateEvent(requestEvent);
        return ResponseEntity.status(HttpStatus.OK).body(updatedEvent);

    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") long id) throws IdInvalidException {
        Event event = this.eventService.fetchEventById(id);
        if (event == null) {
            throw new IdInvalidException("Event với id = " + id + " không tồn tại");
        }
        this.eventService.handleDeleteEvent(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}