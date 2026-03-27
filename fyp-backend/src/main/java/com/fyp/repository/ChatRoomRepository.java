package com.fyp.repository;

import com.fyp.model.entity.ChatRoom;
import com.fyp.model.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants cp WHERE cp.user.id = :userId ORDER BY cr.createdAt DESC")
    List<ChatRoom> findByUserId(@Param("userId") Long userId);

    Optional<ChatRoom> findByTeamId(Long teamId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.roomType = :roomType AND cr.team.id = :teamId")
    Optional<ChatRoom> findByRoomTypeAndTeamId(@Param("roomType") RoomType roomType, @Param("teamId") Long teamId);

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants cp1 JOIN cr.participants cp2 " +
            "WHERE cr.roomType = 'DIRECT' AND cp1.user.id = :userId1 AND cp2.user.id = :userId2")
    Optional<ChatRoom> findDirectRoomBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
