package vn.uet.volunteerhub.domain.response;

import java.time.Instant;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import vn.uet.volunteerhub.util.constant.LevelEnum;

@Getter
@Setter
public class ResUpdateJobDTO {
    private long id;
    private String name;
    private String location;
    private double stipend;
    private int quantity;
    private LevelEnum level;
    private Instant startDate;
    private Instant endDate;
    private Instant updatedAt;
    private String updatedBy;
    private boolean active;

    private List<String> skills;
}
