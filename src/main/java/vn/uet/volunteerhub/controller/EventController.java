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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.dto.ResultPaginationDTO;
import vn.uet.volunteerhub.service.EventService;
import org.springframework.data.domain.Pageable;

@RestController
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
    public ResponseEntity<ResultPaginationDTO> getEvents(
            @RequestParam("current") Optional<String> currentOptional,
            @RequestParam("pageSize") Optional<String> pageSizeOptional) {

        String sCurrent = currentOptional.isPresent() ? currentOptional.get() : "";
        String sPageSize = pageSizeOptional.isPresent() ? pageSizeOptional.get() : "";

        int current = Integer.parseInt(sCurrent);
        int pageSize = Integer.parseInt(sPageSize);

        Pageable pageable = PageRequest.of(current - 1, pageSize);
        ResultPaginationDTO listEvents = this.eventService.fetchAllEvents(pageable);

        return ResponseEntity.status(HttpStatus.OK).body(listEvents);
    }

    @PutMapping("/events")
    public ResponseEntity<Event> updateEvent(@Valid @RequestBody Event requestEvent) {
        Event updatedEvent = this.eventService.handleUpdateEvent(requestEvent);
        return ResponseEntity.status(HttpStatus.OK).body(updatedEvent);

    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") long id) {
        this.eventService.handleDeleteEvent(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}