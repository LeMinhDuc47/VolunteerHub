package vn.uet.volunteerhub.domain.response;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;
import vn.uet.volunteerhub.domain.response.ResCreateUserDTO.RoleUser;
import vn.uet.volunteerhub.util.constant.GenderEnum;

@Getter
@Setter
public class ResUpdateUserDTO {
    private long id;
    private String name;
    private GenderEnum gender;
    private String address;
    private int age;
    private Instant updatedAt;
    private EventUser event;
    private RoleUser role;

    @Getter
    @Setter
    public static class EventUser {
        private long id;
        private String name;
    }

    @Getter
    @Setter
    public static class RoleUser {
        private long id;
        private String name;
    }
}