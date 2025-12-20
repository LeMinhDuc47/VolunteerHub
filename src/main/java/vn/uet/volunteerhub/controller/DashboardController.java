package vn.uet.volunteerhub.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.uet.volunteerhub.domain.response.dashboard.ResDashboardHourlyPointDTO;
import vn.uet.volunteerhub.service.DashboardService;
import vn.uet.volunteerhub.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/hourly")
    @ApiMessage("Get dashboard hourly stats")
    public ResponseEntity<List<ResDashboardHourlyPointDTO>> getHourlyStats(
            @RequestParam(name = "hours", defaultValue = "12") int hours
    ) {
        return ResponseEntity.ok(dashboardService.getHourlyStats(hours));
    }
}
