package com.fyp.controller;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    @Operation(summary = "Get my profile")
    public ResponseEntity<StudentProfileDTO> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.getStudentProfile(userId));
    }

    @GetMapping("/students")
    @Operation(summary = "Search students")
    public ResponseEntity<List<StudentProfileDTO>> searchStudents(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(userService.searchStudents(query));
    }

    @GetMapping("/students/available")
    @Operation(summary = "Get available students (not in a team)")
    public ResponseEntity<List<StudentProfileDTO>> getAvailableStudents() {
        return ResponseEntity.ok(userService.getAvailableStudents());
    }

    @GetMapping("/students/branch/{branch}")
    @Operation(summary = "Get students by branch")
    public ResponseEntity<List<StudentProfileDTO>> getStudentsByBranch(@PathVariable String branch) {
        return ResponseEntity.ok(userService.getStudentsByBranch(branch));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile")
    public ResponseEntity<StudentProfileDTO> updateProfile(
            @RequestBody StudentProfileDTO updates,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userService.updateStudentProfile(userId, updates));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
