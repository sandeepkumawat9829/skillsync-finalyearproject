package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private Long teamId;
    private String teamName;
    private Long projectId;
    private String projectTitle;
    private Long teamLeaderId;
    private String teamLeaderName;
    private Integer currentMemberCount;
    private Integer maxMembers;
    private Boolean isComplete;
    private String status;
    private List<TeamMemberDTO> members;
    private String mentorName;
    private Long mentorId;
    private String createdAt;
}
