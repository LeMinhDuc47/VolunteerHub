package vn.uet.volunteerhub.service;

import java.util.List;
import java.util.Optional;
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

    public Role fetchRoleById(long id) {
        Optional<Role> roleOptional = this.roleRepository.findById(id);
        if (roleOptional.isPresent()) {
            return roleOptional.get();
        }

        return null;
    }

    public Role updateRole(Role requestRole, Role currentRole) {
        // if permission exist
        if (requestRole.getPermissions() != null) {
            List<Long> listPermissionId = requestRole.getPermissions()
                    .stream().map(item -> item.getId())
                    .collect(Collectors.toList());

            List<Permission> listPermissions = this.permissionRepository.findByIdIn(listPermissionId);

            // set permission
            currentRole.setPermissions(listPermissions);
        }

        currentRole.setName(requestRole.getName());
        currentRole.setDescription(requestRole.getDescription());
        currentRole.setActive(requestRole.isActive());

        currentRole = this.roleRepository.save(currentRole);

        return currentRole;
    }
}