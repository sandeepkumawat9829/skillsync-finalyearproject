package com.fyp.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileDTO {
    private Long mentorId;
    private Long userId;
    private String email;
    private String fullName;
    private String employeeId;
    private String department;
    private String designation;
    private List<String> expertise;
    private Integer maxStudents;
    private Integer currentStudents;
    private String phone;
    private String officeLocation;
    private String bio;
    private String profileImageUrl;
    private Integer experience;

    @JsonProperty("isAvailable")
    private Boolean isAvailable;
}
