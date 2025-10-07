package vn.uet.volunteerhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.uet.volunteerhub.domain.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

}