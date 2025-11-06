package vn.uet.volunteerhub.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.uet.volunteerhub.domain.Skill;
import vn.uet.volunteerhub.repository.SkillRepository;

@Service
public class SkillService {
    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public boolean isNameExist(String name) {
        return this.skillRepository.existsByName(name);
    }

    public Skill fetchSkillById(long id) {
        Optional<Skill> skillOptional = this.skillRepository.findById(id);
        if (skillOptional.isPresent()) {
            return skillOptional.get();
        }
        return null;
    }

    public Skill handleCreateSkill(Skill reqSkill) {
        return this.skillRepository.save(reqSkill);
    }

}