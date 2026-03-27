package com.fyp.controller;

import com.fyp.model.dto.AnnouncementDTO;
import com.fyp.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<AnnouncementDTO>> getActiveAnnouncements(
            @RequestParam(defaultValue = "ALL") String audience) {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements(audience));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/important")
    public ResponseEntity<List<AnnouncementDTO>> getImportantAnnouncements() {
        return ResponseEntity.ok(announcementService.getImportantAnnouncements());
    }

    @GetMapping("/{announcementId}")
    public ResponseEntity<AnnouncementDTO> getAnnouncement(@PathVariable Long announcementId) {
        return ResponseEntity.ok(announcementService.getAnnouncement(announcementId));
    }

    @PostMapping
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @RequestBody AnnouncementDTO dto,
            @RequestParam Long userId) {
        return ResponseEntity.ok(announcementService.createAnnouncement(dto, userId));
    }

    @PutMapping("/{announcementId}")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(
            @PathVariable Long announcementId,
            @RequestBody AnnouncementDTO dto) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(announcementId, dto));
    }

    @DeleteMapping("/{announcementId}")
    public ResponseEntity<Void> deactivateAnnouncement(@PathVariable Long announcementId) {
        announcementService.deactivateAnnouncement(announcementId);
        return ResponseEntity.noContent().build();
    }
}
