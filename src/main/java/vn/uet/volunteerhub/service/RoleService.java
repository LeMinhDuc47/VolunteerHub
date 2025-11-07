package vn.uet.volunteerhub.service;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.repository.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
}