package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Permission;
import vn.uet.volunteerhub.domain.Role;
import vn.uet.volunteerhub.repository.PermissionRepository;
import vn.uet.volunteerhub.repository.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    public boolean existByName(String name) {
        return this.roleRepository.existsByName(name);
    }

    /**
     * @param requestRole
     * @return
     */
    public Role handleCreateRole(Role requestRole) {
        // if permission exist
        if (requestRole.getPermissions() != null) {
            List<Long> listPermissionId = requestRole.getPermissions()
                    .stream().map(item -> item.getId())
                    .collect(Collectors.toList());

            List<Permission> listPermissions = this.permissionRepository.findByIdIn(listPermissionId);

            // RequestRole chỉ có thông tin của Id Permission và sau khi tìm
            // Set tất cả Attribute của Permission vào RequestRole
            requestRole.setPermissions(listPermissions);
        }
        return this.roleRepository.save(requestRole);
    }
}