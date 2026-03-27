package com.fyp.service;

import com.fyp.model.dto.AnalyticsDTO;
import com.fyp.model.entity.MentorProfile;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.Task;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.SprintStatus;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;

    public AnalyticsDTO getProjectAnalytics(Long projectId) {
        return buildProjectAnalytics(projectId);
    }

    public AnalyticsDTO getProjectAnalytics(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);
        return buildProjectAnalytics(projectId);
    }

    private AnalyticsDTO buildProjectAnalytics(Long projectId) {
        // Get task distribution by status
        List<Task> allTasks = taskRepository.findByProjectId(projectId);
        Map<String, Integer> tasksByStatus = allTasks.stream()
                .collect(Collectors.groupingBy(
                        Task::getColumnName,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));

        // Get completed tasks count
        int completedTasks = tasksByStatus.getOrDefault("DONE", 0);
        int totalTasks = allTasks.size();
        double completionRate = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0;

        // Get sprint data
        List<Sprint> sprints = sprintRepository.findByProjectIdOrderBySprintNumberDesc(projectId);
        Sprint activeSprint = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.ACTIVE)
                .findFirst()
                .orElse(null);
        Sprint latestCompletedSprint = sprints.stream()
                .filter(s -> s.getStatus() == SprintStatus.COMPLETED)
                .findFirst()
                .orElse(null);
        Sprint referenceSprint = activeSprint != null ? activeSprint : latestCompletedSprint;

        List<AnalyticsDTO.SprintMetric> sprintMetrics = sprints.stream()
                .map(this::toSprintMetric)
                .toList();

        // Calculate velocity data
        List<AnalyticsDTO.VelocityPoint> velocityData = sprintMetrics.stream()
                .filter(metric -> metric.getCompletedTasks() != null && metric.getSprintName() != null)
                .limit(5)
                .map(metric -> AnalyticsDTO.VelocityPoint.builder()
                        .sprintName(metric.getSprintName())
                        .committedPoints(metric.getCommittedPoints())
                        .completedPoints(metric.getCompletedTasks())
                        .completionPercentage(metric.getCompletionRate())
                        .build())
                .collect(Collectors.toList());

        // Calculate average velocity
        double avgVelocity = velocityData.stream()
                .mapToInt(AnalyticsDTO.VelocityPoint::getCompletedPoints)
                .average()
                .orElse(0);

        // Get burndown data for active sprint
        List<AnalyticsDTO.BurndownPoint> burndownData = new ArrayList<>();
        if (referenceSprint != null) {
            burndownData = calculateBurndownData(referenceSprint);
        }

        // Get team contribution
        List<AnalyticsDTO.ContributionData> contributionData = calculateContributionData(projectId, allTasks);

        // Get time metrics
        BigDecimal totalHours = timeEntryRepository.sumHoursByProjectId(projectId);
        double totalHoursVal = totalHours != null ? totalHours.doubleValue() : 0;
        double avgHoursPerTask = completedTasks > 0 ? totalHoursVal / completedTasks : 0;

        AnalyticsDTO.TimeMetrics timeMetrics = AnalyticsDTO.TimeMetrics.builder()
                .totalHoursLogged(totalHoursVal)
                .averageHoursPerTask(Math.round(avgHoursPerTask * 100.0) / 100.0)
                .hoursThisWeek(0.0) // Could be calculated per user
                .build();

        // Determine team efficiency
        String teamEfficiency;
        if (completionRate >= 80)
            teamEfficiency = "high";
        else if (completionRate >= 50)
            teamEfficiency = "medium";
        else
            teamEfficiency = "low";

        // Calculate sprint progress
        int sprintProgress = 0;
        int currentVelocity = 0;
        if (referenceSprint != null) {
            AnalyticsDTO.SprintMetric referenceMetric = toSprintMetric(referenceSprint);
            currentVelocity = referenceMetric.getVelocity();
            if (referenceMetric.getCommittedPoints() != null && referenceMetric.getCommittedPoints() > 0) {
                sprintProgress = (int) Math.round(referenceMetric.getCompletionRate());
            }
        }

        return AnalyticsDTO.builder()
                .currentVelocity(currentVelocity)
                .sprintProgress(sprintProgress)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .totalTasksCompleted(completedTasks)
                .averageVelocity(Math.round(avgVelocity * 100.0) / 100.0)
                .teamEfficiency(teamEfficiency)
                .burndownData(burndownData)
                .velocityData(velocityData)
                .sprintMetrics(sprintMetrics)
                .contributionData(contributionData)
                .tasksByStatus(tasksByStatus)
                .timeMetrics(timeMetrics)
                .build();
    }

    private List<AnalyticsDTO.BurndownPoint> calculateBurndownData(Sprint sprint) {
        List<AnalyticsDTO.BurndownPoint> data = new ArrayList<>();

        LocalDate startDate = sprint.getStartDate().toLocalDate();
        LocalDate endDate = sprint.getEndDate().toLocalDate();
        LocalDate today = LocalDate.now();

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate);
        AnalyticsDTO.SprintMetric metric = toSprintMetric(sprint);
        int totalTasks = metric.getCommittedPoints();
        int completedTasks = metric.getCompletedTasks();

        if (totalTasks <= 0) {
            return data;
        }

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            long dayNumber = ChronoUnit.DAYS.between(startDate, date);
            int idealRemaining = (int) Math.round(totalTasks * (1 - (double) dayNumber / totalDays));

            // Actual remaining is harder to calculate without historical data
            // For now, we'll estimate based on current completion
            int actualRemaining = totalTasks - completedTasks;
            if (date.isBefore(today)) {
                // Interpolate for past dates
                long daysElapsed = ChronoUnit.DAYS.between(startDate, date);
                long totalDaysElapsed = ChronoUnit.DAYS.between(startDate, today);
                if (totalDaysElapsed > 0) {
                    actualRemaining = (int) (totalTasks
                            - (completedTasks * daysElapsed / totalDaysElapsed));
                }
            }

            data.add(AnalyticsDTO.BurndownPoint.builder()
                    .date(date)
                    .idealRemaining(idealRemaining)
                    .actualRemaining(Math.max(0, actualRemaining))
                    .build());
        }

        return data;
    }

    private List<AnalyticsDTO.ContributionData> calculateContributionData(Long projectId, List<Task> allTasks) {
        // Group completed tasks by assignee
        Map<Long, Long> tasksByUser = allTasks.stream()
                .filter(t -> "DONE".equals(t.getColumnName()) && t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getAssignedTo().getId(),
                        Collectors.counting()));

        long totalCompleted = tasksByUser.values().stream().mapToLong(Long::longValue).sum();

        return tasksByUser.entrySet().stream()
                .map(entry -> {
                    String userName = resolveContributionMemberName(entry.getKey());
                    int tasksCompleted = entry.getValue().intValue();
                    double percentage = totalCompleted > 0 ? (tasksCompleted * 100.0 / totalCompleted) : 0;

                    return AnalyticsDTO.ContributionData.builder()
                            .memberName(userName)
                            .tasksCompleted(tasksCompleted)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .sorted((a, b) -> b.getTasksCompleted() - a.getTasksCompleted())
                .collect(Collectors.toList());
    }

    private String resolveContributionMemberName(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .map(StudentProfile::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .or(() -> mentorProfileRepository.findByUserId(userId)
                        .map(MentorProfile::getFullName)
                        .filter(name -> name != null && !name.isBlank()))
                .or(() -> userRepository.findById(userId)
                        .map(User::getEmail)
                        .filter(email -> email != null && !email.isBlank()))
                .orElse("User " + userId);
    }

    private AnalyticsDTO.SprintMetric toSprintMetric(Sprint sprint) {
        List<Task> sprintTasks = taskRepository.findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(sprint.getId());
        int totalTasks = sprintTasks.size();
        int completedTasks = (int) sprintTasks.stream()
                .filter(task -> "DONE".equals(task.getColumnName()))
                .count();
        double completionRate = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0;

        return AnalyticsDTO.SprintMetric.builder()
                .sprintNumber(sprint.getSprintNumber())
                .sprintName(sprint.getSprintName())
                .startDate(sprint.getStartDate() != null ? sprint.getStartDate().toLocalDate() : null)
                .endDate(sprint.getEndDate() != null ? sprint.getEndDate().toLocalDate() : null)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .velocity(completedTasks)
                .committedPoints(totalTasks)
                .build();
    }

    private void validateProjectAccess(Project project, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
            return;
        }

        Team team = teamRepository.findByProjectId(project.getId()).orElse(null);
        if (team == null) {
            throw new RuntimeException("You do not have access to this project's analytics");
        }

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId);
        boolean isAssignedMentor = mentorAssignmentRepository.findByTeamId(team.getId())
                .map(assignment -> assignment.getMentor() != null && assignment.getMentor().getId().equals(userId))
                .orElse(false);

        if (!isLeader && !isMember && !isAssignedMentor) {
            throw new RuntimeException("You do not have access to this project's analytics");
        }
    }
}
