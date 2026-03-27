package com.fyp.service;

import com.fyp.model.dto.ProjectDTO;
import com.fyp.model.dto.TeamDTO;
import com.fyp.model.dto.UserDTO;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

@Service
public class ReportExportService {

    public String generateUsersCsv(List<UserDTO> users) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Header
        pw.println("ID,Email,Role,Status,Created At");

        // Data
        for (UserDTO user : users) {
            pw.printf("%d,%s,%s,%s,%s\n",
                    user.getId(),
                    escapeCsv(user.getEmail()),
                    user.getRole(),
                    user.isEnabled() ? "Active" : "Disabled",
                    user.getCreatedAt());
        }

        return sw.toString();
    }

    public String generateProjectsCsv(List<ProjectDTO> projects) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Header
        pw.println("Project ID,Title,Domain,Creator Name,Status,Created At");

        // Data
        for (ProjectDTO project : projects) {
            pw.printf("%d,%s,%s,%s,%s,%s\n",
                    project.getProjectId(),
                    escapeCsv(project.getTitle()),
                    escapeCsv(project.getDomain()),
                    escapeCsv(project.getCreatedByName()),
                    project.getStatus(),
                    project.getCreatedAt());
        }

        return sw.toString();
    }

    public String generateTeamsCsv(List<TeamDTO> teams) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Header
        pw.println("Team ID,Team Name,Project ID,Project Title,Leader Email,Status,Is Complete");

        // Data
        for (TeamDTO team : teams) {
            pw.printf("%d,%s,%s,%s,%s,%s,%s\n",
                    team.getTeamId(),
                    escapeCsv(team.getTeamName()),
                    team.getProjectId() != null ? team.getProjectId() : "",
                    escapeCsv(team.getProjectTitle() != null ? team.getProjectTitle() : ""),
                    escapeCsv(team.getTeamLeaderName() != null ? team.getTeamLeaderName() : ""),
                    team.getStatus(),
                    team.getIsComplete() != null && team.getIsComplete() ? "Yes" : "No");
        }

        return sw.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
