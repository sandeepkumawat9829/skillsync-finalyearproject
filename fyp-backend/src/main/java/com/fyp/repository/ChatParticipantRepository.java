package com.fyp.repository;

import com.fyp.model.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    List<ChatParticipant> findByChatRoomId(Long roomId);

    Optional<ChatParticipant> findByChatRoomIdAndUserId(Long roomId, Long userId);

    @Modifying
    @Query("UPDATE ChatParticipant cp SET cp.lastReadAt = :lastReadAt WHERE cp.chatRoom.id = :roomId AND cp.user.id = :userId")
    void updateLastReadAt(@Param("roomId") Long roomId, @Param("userId") Long userId,
            @Param("lastReadAt") LocalDateTime lastReadAt);

    boolean existsByChatRoomIdAndUserId(Long roomId, Long userId);
}
