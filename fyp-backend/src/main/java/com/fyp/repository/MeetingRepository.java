package com.fyp.repository;

import com.fyp.model.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByTeamId(Long teamId);

    List<Meeting> findByMentorId(Long mentorId);

    List<Meeting> findByScheduledAtAfter(LocalDateTime dateTime);

    List<Meeting> findByTeamIdAndScheduledAtAfter(Long teamId, LocalDateTime dateTime);

    // Find upcoming meetings for a user (as team member or mentor)
    @Query("SELECT m FROM Meeting m WHERE (m.mentor.id = :userId OR m.team.id IN " +
            "(SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId)) " +
            "AND m.scheduledAt > :now AND m.status != 'CANCELLED' ORDER BY m.scheduledAt ASC")
    List<Meeting> findUpcomingMeetingsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Find past meetings for a user
    @Query("SELECT m FROM Meeting m WHERE (m.mentor.id = :userId OR m.team.id IN " +
            "(SELECT tm.team.id FROM TeamMember tm WHERE tm.user.id = :userId)) " +
            "AND m.scheduledAt <= :now ORDER BY m.scheduledAt DESC")
    List<Meeting> findPastMeetingsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
