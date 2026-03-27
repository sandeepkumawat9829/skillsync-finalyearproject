package com.fyp.repository;

import com.fyp.model.entity.ShowcaseLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ShowcaseLikeRepository extends JpaRepository<ShowcaseLike, Long> {

    Optional<ShowcaseLike> findByUserIdAndShowcaseId(Long userId, Long showcaseId);

    boolean existsByUserIdAndShowcaseId(Long userId, Long showcaseId);

    @Modifying
    @Transactional
    void deleteByUserIdAndShowcaseId(Long userId, Long showcaseId);

    Long countByShowcaseId(Long showcaseId);
}
