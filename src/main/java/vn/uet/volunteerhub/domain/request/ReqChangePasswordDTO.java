package vn.uet.volunteerhub.domain.request;

import jakarta.validation.constraints.NotBlank;

public class ReqChangePasswordDTO {
    @NotBlank(message = "currentPassword không được để trống")
    private String currentPassword;
    @NotBlank(message = "newPassword không được để trống")
    private String newPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
