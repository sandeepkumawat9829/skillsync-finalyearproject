package com.fyp.service;

import com.fyp.model.entity.*;
import com.fyp.repository.*;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final StudentProfileRepository studentProfileRepository;

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(102, 126, 234);
    private static final DeviceRgb SECONDARY_COLOR = new DeviceRgb(118, 75, 162);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateProjectReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf)) {

            // Header
            addHeader(document, "Project Report");

            // Project Details
            addSectionTitle(document, "Project Information");
            addKeyValue(document, "Title", project.getTitle());
            addKeyValue(document, "Domain", project.getDomain() != null ? project.getDomain() : "N/A");
            addKeyValue(document, "Status", project.getStatus().name());
            addKeyValue(document, "Created At", project.getCreatedAt().format(DATE_FORMATTER));

            // Abstract
            addSectionTitle(document, "Abstract");
            document.add(new Paragraph(project.getAbstractText())
                    .setFontSize(11)
                    .setMarginBottom(15));

            // Technologies
            if (project.getTechnologies() != null && !project.getTechnologies().isEmpty()) {
                addSectionTitle(document, "Technologies");
                document.add(new Paragraph(String.join(", ", project.getTechnologies()))
                        .setFontSize(11)
                        .setMarginBottom(15));
            }

            // Team Members
            Team team = project.getTeam();
            if (team != null) {
                addSectionTitle(document, "Team Members");
                List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
                Table memberTable = new Table(UnitValue.createPercentArray(new float[] { 3, 2, 2 }))
                        .useAllAvailableWidth();
                addTableHeader(memberTable, "Name", "Role", "Joined");

                for (TeamMember member : members) {
                    String memberName = getMemberName(member.getUser());
                    memberTable.addCell(createCell(memberName));
                    memberTable.addCell(createCell(member.getRole().name()));
                    memberTable.addCell(createCell(member.getJoinedAt().format(DATE_FORMATTER)));
                }
                document.add(memberTable);
            }

            // Milestones
            List<Milestone> milestones = milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId);
            if (!milestones.isEmpty()) {
                addSectionTitle(document, "Milestones");
                Table milestoneTable = new Table(UnitValue.createPercentArray(new float[] { 4, 2, 2, 2 }))
                        .useAllAvailableWidth();
                addTableHeader(milestoneTable, "Milestone", "Status", "Progress", "Due Date");

                for (Milestone milestone : milestones) {
                    milestoneTable.addCell(createCell(milestone.getMilestoneName()));
                    milestoneTable.addCell(createCell(milestone.getStatus().name()));
                    milestoneTable.addCell(createCell(milestone.getCompletionPercentage() + "%"));
                    milestoneTable.addCell(createCell(
                            milestone.getDueDate() != null ? milestone.getDueDate().format(DATE_FORMATTER) : "N/A"));
                }
                document.add(milestoneTable);
            }

            // Footer
            addFooter(document);

        } catch (Exception e) {
            log.error("Error generating project PDF report", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return baos.toByteArray();
    }

    public byte[] generateTeamReport(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf)) {

            addHeader(document, "Team Report");

            // Team Info
            addSectionTitle(document, "Team Information");
            addKeyValue(document, "Team Name", team.getTeamName() != null ? team.getTeamName() : "Unnamed Team");
            addKeyValue(document, "Status", team.getStatus().name());
            addKeyValue(document, "Members", team.getCurrentMemberCount() + "/" + team.getMaxMembers());

            // Project
            if (team.getProject() != null) {
                addSectionTitle(document, "Project");
                addKeyValue(document, "Title", team.getProject().getTitle());
                addKeyValue(document, "Status", team.getProject().getStatus().name());
            }

            // Team Members
            addSectionTitle(document, "Team Members");
            List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);
            Table memberTable = new Table(UnitValue.createPercentArray(new float[] { 3, 2, 2 }))
                    .useAllAvailableWidth();
            addTableHeader(memberTable, "Name", "Role", "Contribution");

            for (TeamMember member : members) {
                String memberName = getMemberName(member.getUser());
                memberTable.addCell(createCell(memberName));
                memberTable.addCell(createCell(member.getRole().name()));
                memberTable.addCell(createCell(member.getContributionScore() + " pts"));
            }
            document.add(memberTable);

            addFooter(document);

        } catch (Exception e) {
            log.error("Error generating team PDF report", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return baos.toByteArray();
    }

    public byte[] generateStudentSummary(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf)) {

            addHeader(document, "Student Summary Report");

            // Profile Info
            addSectionTitle(document, "Personal Information");
            addKeyValue(document, "Name", profile.getFullName());
            addKeyValue(document, "Enrollment", profile.getEnrollmentNumber());
            addKeyValue(document, "Branch", profile.getBranch());
            addKeyValue(document, "Semester", String.valueOf(profile.getCurrentSemester()));
            addKeyValue(document, "CGPA", String.valueOf(profile.getCgpa()));

            // Skills
            if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                addSectionTitle(document, "Skills");
                document.add(new Paragraph(String.join(", ", profile.getSkills()))
                        .setFontSize(11)
                        .setMarginBottom(15));
            }

            // Bio
            if (profile.getBio() != null && !profile.getBio().isEmpty()) {
                addSectionTitle(document, "About");
                document.add(new Paragraph(profile.getBio())
                        .setFontSize(11)
                        .setMarginBottom(15));
            }

            addFooter(document);

        } catch (Exception e) {
            log.error("Error generating student summary PDF", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return baos.toByteArray();
    }

    private void addHeader(Document document, String title) {
        document.add(new Paragraph("FYP Management System")
                .setFontSize(12)
                .setFontColor(PRIMARY_COLOR)
                .setMarginBottom(5));

        document.add(new Paragraph(title)
                .setFontSize(24)
                .setBold()
                .setFontColor(SECONDARY_COLOR)
                .setMarginBottom(20));
    }

    private void addSectionTitle(Document document, String title) {
        document.add(new Paragraph(title)
                .setFontSize(14)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setMarginTop(15)
                .setMarginBottom(10));
    }

    private void addKeyValue(Document document, String key, String value) {
        Table table = new Table(UnitValue.createPercentArray(new float[] { 1, 2 }))
                .useAllAvailableWidth()
                .setMarginBottom(5);
        table.addCell(new Cell().add(new Paragraph(key + ":").setBold().setFontSize(11))
                .setBorder(null));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "N/A").setFontSize(11))
                .setBorder(null));
        document.add(table);
    }

    private void addTableHeader(Table table, String... headers) {
        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(PRIMARY_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(8));
        }
    }

    private Cell createCell(String content) {
        return new Cell()
                .add(new Paragraph(content != null ? content : "N/A").setFontSize(10))
                .setPadding(5);
    }

    private void addFooter(Document document) {
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Generated on " + LocalDateTime.now().format(DATE_FORMATTER))
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("FYP Management System © 2026")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER));
    }

    private String getMemberName(User user) {
        return studentProfileRepository.findByUserId(user.getId())
                .map(StudentProfile::getFullName)
                .orElse(user.getEmail());
    }
}
