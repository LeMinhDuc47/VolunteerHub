package vn.uet.volunteerhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
}