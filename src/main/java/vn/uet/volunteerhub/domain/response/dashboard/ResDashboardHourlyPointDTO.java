package vn.uet.volunteerhub.domain.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResDashboardHourlyPointDTO {
    private String hour;

    private String label;

    private long users;
    private long events;
    private long jobs;
}
