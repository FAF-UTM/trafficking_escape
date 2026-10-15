package org.example.backend.repos;

import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByAccessCodeSha256(String accessCodeSha256);

    boolean existsByAccessCodeSha256(String accessCodeSha256);

    List<User> findAllByCreatedByOrderByExpirationDateDesc(String createdBy);

    /**
     * Atomically clears a user's access code. Returns 0 when it was already cleared,
     * so two concurrent logins cannot both consume the same one-time code.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update User u
               set u.accessCodeHash = null, u.accessCodeSha256 = null
             where u.id = :id and u.accessCodeSha256 is not null
            """)
    int consumeAccessCode(@Param("id") Long id);
}
