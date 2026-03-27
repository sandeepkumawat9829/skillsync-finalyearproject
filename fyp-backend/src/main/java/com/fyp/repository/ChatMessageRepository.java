package com.fyp.repository;

import com.fyp.model.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(@Param("roomId") Long roomId);

    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Page<ChatMessage> findByRoomIdOrderByCreatedAtDesc(@Param("roomId") Long roomId, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.createdAt > :since AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ChatMessage> findNewMessages(@Param("roomId") Long roomId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.createdAt > :lastReadAt AND m.isDeleted = false")
    Long countUnreadMessages(@Param("roomId") Long roomId, @Param("lastReadAt") LocalDateTime lastReadAt);
}
