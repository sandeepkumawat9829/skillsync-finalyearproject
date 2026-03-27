package com.fyp.repository;

import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);
    
    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);
}
