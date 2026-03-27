package com.fyp.service;

import com.fyp.model.dto.AnnouncementDTO;
import com.fyp.model.entity.Announcement;
import com.fyp.model.entity.Announcement.AnnouncementType;
import com.fyp.model.entity.Announcement.TargetAudience;
import com.fyp.model.entity.User;
import com.fyp.repository.AnnouncementRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public List<AnnouncementDTO> getActiveAnnouncements(String audience) {
        TargetAudience targetAudience = TargetAudience.valueOf(audience.toUpperCase());
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now(), targetAudience)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AnnouncementDTO> getImportantAnnouncements() {
        return announcementRepository.findImportantAnnouncements(LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AnnouncementDTO getAnnouncement(Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        return toDTO(announcement);
    }

    @Transactional
    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Announcement announcement = Announcement.builder()
                .postedBy(user)
                .title(dto.getTitle())
                .content(dto.getContent())
                .announcementType(AnnouncementType.valueOf(dto.getAnnouncementType()))
                .targetAudience(TargetAudience.valueOf(dto.getTargetAudience()))
                .expiresAt(dto.getExpiresAt())
                .isActive(true)
                .build();

        announcement = announcementRepository.save(announcement);
        return toDTO(announcement);
    }

    @Transactional
    public AnnouncementDTO updateAnnouncement(Long announcementId, AnnouncementDTO dto) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if (dto.getTitle() != null)
            announcement.setTitle(dto.getTitle());
        if (dto.getContent() != null)
            announcement.setContent(dto.getContent());
        if (dto.getAnnouncementType() != null) {
            announcement.setAnnouncementType(AnnouncementType.valueOf(dto.getAnnouncementType()));
        }
        if (dto.getTargetAudience() != null) {
            announcement.setTargetAudience(TargetAudience.valueOf(dto.getTargetAudience()));
        }
        if (dto.getExpiresAt() != null)
            announcement.setExpiresAt(dto.getExpiresAt());

        announcement = announcementRepository.save(announcement);
        return toDTO(announcement);
    }

    @Transactional
    public void deactivateAnnouncement(Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setIsActive(false);
        announcementRepository.save(announcement);
    }

    private AnnouncementDTO toDTO(Announcement announcement) {
        return AnnouncementDTO.builder()
                .announcementId(announcement.getAnnouncementId())
                .postedById(announcement.getPostedBy().getId())
                .postedByName(announcement.getPostedBy().getEmail())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .announcementType(announcement.getAnnouncementType().name())
                .targetAudience(announcement.getTargetAudience().name())
                .isActive(announcement.getIsActive())
                .createdAt(announcement.getCreatedAt())
                .expiresAt(announcement.getExpiresAt())
                .build();
    }
}
