package vn.uet.volunteerhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

import vn.uet.volunteerhub.domain.Event;
import vn.uet.volunteerhub.domain.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    List<Post> findByEventOrderByCreatedAtDesc(Event event);
}
