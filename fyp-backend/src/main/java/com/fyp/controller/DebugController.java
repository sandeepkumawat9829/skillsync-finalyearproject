package com.fyp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.fyp.service.ProjectService;
import com.fyp.service.TeamService;
import com.fyp.service.TaskService;
import com.fyp.service.NotificationService;
import com.fyp.model.dto.ProjectDTO;
import com.fyp.model.dto.TeamDTO;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

@RestController
public class DebugController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/api/public/debug-error")
    public String debugError() {
        try {
            // Assume user ID 2 is the test user 'cloudtest_final@test.com'
            List<ProjectDTO> projects = projectService.getMyProjects(2L);
            TeamDTO team = teamService.getMyTeam(2L);
            int tasks = taskService.getTasksByUser(2L).size();
            int notifications = notificationService.getMyNotifications(2L).size();
            return "Success: " + projects.size() + " projects, Team: " + (team != null ? team.getTeamName() : "No team") + 
                   ", Tasks: " + tasks + ", Notifications: " + notifications;
        } catch (Throwable e) {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            return sw.toString().replace("\n", "<br/>\n");
        }
    }
}
