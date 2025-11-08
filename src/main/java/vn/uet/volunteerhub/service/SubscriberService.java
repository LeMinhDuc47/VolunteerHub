package vn.uet.volunteerhub.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import jakarta.validation.Valid;
import vn.uet.volunteerhub.domain.Skill;
import vn.uet.volunteerhub.domain.Subscriber;
import vn.uet.volunteerhub.repository.SkillRepository;
import vn.uet.volunteerhub.repository.SubscriberRepository;

@Service
public class SubscriberService {

    private final SubscriberRepository subscriberRepository;
    private final SkillRepository skillRepository;

    public SubscriberService(SubscriberRepository subscriberRepository, SkillRepository skillRepository) {
        this.subscriberRepository = subscriberRepository;
        this.skillRepository = skillRepository;
    }

    public boolean isExistEmail(String email) {
        return this.subscriberRepository.existsByEmail(email);
    }

    public Subscriber handleCreateSubscriber(Subscriber requestSubscriber) {
        // check Skill id exist
        if (requestSubscriber.getSkills() != null) {

            List<Long> listIdSkill = new ArrayList<>();
            // get List Skill id
            for (Skill skill : requestSubscriber.getSkills()) {
                listIdSkill.add(skill.getId());
            }

            List<Skill> listSkills = this.skillRepository.findByIdIn(listIdSkill);
            requestSubscriber.setSkills(listSkills);
        }
        return this.subscriberRepository.save(requestSubscriber);
    }
}