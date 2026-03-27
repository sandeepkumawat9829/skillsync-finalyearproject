package com.fyp.repository;

import com.fyp.model.entity.Announcement;
import com.fyp.model.entity.Announcement.TargetAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE a.isActive = true AND " +
            "(a.expiresAt IS NULL OR a.expiresAt > :now) AND " +
            "(a.targetAudience = 'ALL' OR a.targetAudience = :audience) " +
            "ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncements(LocalDateTime now, TargetAudience audience);

    List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT a FROM Announcement a WHERE a.announcementType = 'IMPORTANT' AND a.isActive = true " +
            "AND (a.expiresAt IS NULL OR a.expiresAt > :now)")
    List<Announcement> findImportantAnnouncements(LocalDateTime now);
}
