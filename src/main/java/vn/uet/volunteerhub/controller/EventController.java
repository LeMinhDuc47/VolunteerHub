package vn.uet.volunteerhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.service.EventService;

@RestController
public class EventController {

    private final EventService companyService;

    public EventController(EventService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/events")
    public ResponseEntity<Event> createNewEvent(@Valid @RequestBody Event reqEvent) {
        Event newEvent = this.companyService.handleCreateEvent(reqEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEvents() {
        List<Event> listEvents = this.companyService.fetchAllEvents();
        return ResponseEntity.status(HttpStatus.OK).body(listEvents);
    }

    @PutMapping("/events")
    public ResponseEntity<Event> updateEvent(@Valid @RequestBody Event requestEvent) {
        Event updatedEvent = this.companyService.handleUpdateEvent(requestEvent);
        return ResponseEntity.status(HttpStatus.OK).body(updatedEvent);

    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") long id) {
        this.companyService.handleDeleteEvent(id);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}