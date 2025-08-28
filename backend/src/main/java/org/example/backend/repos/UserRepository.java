package org.example.backend.repos;

import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);

    Optional<User> findByAccessCodeSha256(String accessCodeSha256);

    @Query("select u from User u where (u.expirationDate is null or u.expirationDate > :now)")
    List<User> findAllActive(@Param("now") Instant now);

    List<User> findAllByCreatedBy(String createdBy);
}
