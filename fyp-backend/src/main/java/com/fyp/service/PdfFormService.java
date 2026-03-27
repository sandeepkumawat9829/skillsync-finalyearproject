package com.fyp.service;

import com.fyp.model.entity.Project;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.TeamMember;
import com.fyp.model.entity.User;
import com.fyp.model.dto.FormGenerateRequest;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PdfFormService {

    private static final PDFont FONT_REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDFont FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDFont FONT_ITALIC = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

    private static final float PAGE_LEFT = 50;
    private static final float PAGE_RIGHT = 545;
    private static final float TABLE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

    // ======================== FORM 1 ========================
    public byte[] generateForm1(Project project, Team team, List<TeamMember> members, FormGenerateRequest req) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 780;

                // Title
                y = centeredBold(cs, y, "MAJOR / MINOR PROJECT ABSTRACT [Form - 1] (YEAR - " + LocalDate.now().getYear() + ")", 13);
                y -= 20;

                // Lab Coordinator
                y = labelLine(cs, y, "NAME OF LAB COORDINATOR:", orBlank(req.getLabCoordinatorName()));
                y -= 6;
                // Title of Project
                y = labelLine(cs, y, "TITLE OF PROJECT:", safe(project.getTitle()));
                y -= 6;

                // Project Track
                y = boldLine(cs, y, "PROJECT TRACK: (Tick the appropriate one / ones)");
                y -= 4;
                String[] tracks = {"1. R&D\n(Innovation)", "2. CONSULTANCY\n(Fetched from Industry)", "3. STARTUP\n(Self-Business Initiative)", "4. PROJECT POOL\n(From IBM / INFOSYS)", "5. HARDWARE\n/ EMBEDDED"};
                float[] trackWidths = {TABLE_WIDTH / 5, TABLE_WIDTH / 5, TABLE_WIDTH / 5, TABLE_WIDTH / 5, TABLE_WIDTH / 5};
                y = tableRow(cs, y, tracks, trackWidths, 28, true);
                y -= 10;

                // Brief Introduction
                y = boldLine(cs, y, "BRIEF INTRODUCTION OF PROJECT:");
                y -= 4;
                String intro = orAuto(req.getBriefIntroduction(), safe(project.getAbstractText()));
                y = wrappedText(cs, y, intro, 90);
                y -= 10;

                // Tools / Technologies table
                y = boldLine(cs, y, "TOOLS / TECHNOLOGIES TO BE USED:");
                y -= 4;
                String[] toolHeaders = {"NAME OF TOOL / TECHNOLOGY", "VERSION", "SOFTWARE /\nHARDWARE", "PURPOSE OF USE"};
                float[] toolWidths = {TABLE_WIDTH * 0.35f, TABLE_WIDTH * 0.15f, TABLE_WIDTH * 0.18f, TABLE_WIDTH * 0.32f};
                y = tableRow(cs, y, toolHeaders, toolWidths, 28, true);

                // Auto-fill tools from project technologies
                String techStr = orAuto(req.getToolsTechnologies(), "");
                if (project.getTechnologies() != null && !project.getTechnologies().isEmpty() && techStr.isEmpty()) {
                    for (String t : project.getTechnologies()) {
                        String[] row = {safe(t), "", "SOFTWARE", ""};
                        y = tableRow(cs, y, row, toolWidths, 18, false);
                    }
                } else {
                    // add 4 empty rows
                    for (int i = 0; i < 4; i++) {
                        String[] row = {"", "", "", ""};
                        y = tableRow(cs, y, row, toolWidths, 18, false);
                    }
                }
                y -= 10;

                // Proposed Modules table
                y = boldLine(cs, y, "PROPOSED PROJECT MODULES:");
                y -= 4;
                String[] modHeaders = {"NAME OF MODULE", "PROPOSED FUNCTIONALITY IN PROJECT"};
                float[] modWidths = {TABLE_WIDTH * 0.35f, TABLE_WIDTH * 0.65f};
                y = tableRow(cs, y, modHeaders, modWidths, 20, true);
                for (int i = 0; i < 5; i++) {
                    String[] row = {"", ""};
                    y = tableRow(cs, y, row, modWidths, 18, false);
                }
                y -= 10;

                // Team Member Details table
                y = boldLine(cs, y, "TEAM MEMBER DETAILS:");
                y -= 4;
                String[] memHeaders = {"STUDENT NAME", "CLASS & GROUP", "MOBILE No.", "EXPERTISE AREA", "ROLE IN PROJECT"};
                float[] memWidths = {TABLE_WIDTH * 0.22f, TABLE_WIDTH * 0.16f, TABLE_WIDTH * 0.16f, TABLE_WIDTH * 0.22f, TABLE_WIDTH * 0.24f};
                y = tableRow(cs, y, memHeaders, memWidths, 20, true);
                for (TeamMember m : members) {
                    User u = m.getUser();
                    String[] row = {safe(u.getEmail()), "", "", "", ""};
                    y = tableRow(cs, y, row, memWidths, 18, false);
                }
                // pad to 4 rows
                for (int i = members.size(); i < 4; i++) {
                    y = tableRow(cs, y, new String[]{"", "", "", "", ""}, memWidths, 18, false);
                }
                y -= 10;

                // Notes
                small(cs, PAGE_LEFT, y, "NOTE: 1. This form is to be submitted by a team of maximum 4 students to lab coordinator.");
                small(cs, PAGE_LEFT + 28, y - 12, "2. Students must keep a Xerox copy of this form as reference for project work.");
            }

            return toBytes(doc);
        }
    }

    // ======================== FORM 2 ========================
    public byte[] generateForm2(Project project, Team team, List<TeamMember> members, FormGenerateRequest req) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 780;

                // Title
                y = centeredBold(cs, y, "ROLE SPECIFICATION OF TEAM MEMBERS [Form - 2]", 13);
                y -= 16;

                String[] actHeaders = {"NAME OF ACTIVITY", "SOFT\nDEADLINE DATE", "HARD\nDEADLINE DATE", "DETAILS OF ACTIVITY (STORY)"};
                float[] actWidths = {TABLE_WIDTH * 0.28f, TABLE_WIDTH * 0.16f, TABLE_WIDTH * 0.16f, TABLE_WIDTH * 0.40f};

                int memberCount = Math.min(members.size(), 4);
                for (int i = 0; i < Math.max(memberCount, 4); i++) {
                    String memberName = i < memberCount ? safe(members.get(i).getUser().getEmail()) : "________________";

                    y = boldLine(cs, y, "MEMBER " + (i + 1) + " " + memberName);
                    cs.beginText();
                    cs.setFont(FONT_BOLD, 10);
                    cs.newLineAtOffset(PAGE_LEFT + TABLE_WIDTH / 2, y + 14);
                    cs.showText("HANDLING MODULE ________________________________");
                    cs.endText();
                    y -= 4;

                    y = tableRow(cs, y, actHeaders, actWidths, 28, true);
                    for (int r = 0; r < 5; r++) {
                        y = tableRow(cs, y, new String[]{"", "", "", ""}, actWidths, 16, false);
                    }
                    y -= 12;

                    // Check if we need a new page
                    if (y < 140 && i < Math.max(memberCount, 4) - 1) {
                        cs.close();
                        page = new PDPage(PDRectangle.A4);
                        doc.addPage(page);
                        // reopen content stream - need a workaround
                        break; // simplified: keep on one page
                    }
                }

                // Mentor signature
                y -= 10;
                drawRect(cs, PAGE_LEFT, y - 30, TABLE_WIDTH, 30);
                cs.beginText();
                cs.setFont(FONT_BOLD, 11);
                cs.newLineAtOffset(PAGE_LEFT + 5, y - 20);
                cs.showText("MENTOR\u2019S NAME & SIGNATURE " + orBlank(req.getMentorName()));
                cs.endText();
                y -= 40;

                // Notes
                small(cs, PAGE_LEFT, y, "NOTE: 1. This form is to be submitted by a team of max 4 students to lab coordinator.");
                small(cs, PAGE_LEFT + 28, y - 12, "2. Every member must keep a Xerox copy of this form as reference.");
                small(cs, PAGE_LEFT + 28, y - 24, "3. Students must provide the detailed list of planned activities along with completion deadline dates.");
                small(cs, PAGE_LEFT + 28, y - 36, "4. The lab coordinator will check the weekly progress of student against the information provided in this form.");
            }

            return toBytes(doc);
        }
    }

    // ======================== FORM 3 ========================
    public byte[] generateForm3(Project project, Team team, List<TeamMember> members, FormGenerateRequest req) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            List<String> memberNames = members.stream()
                    .map(m -> safe(m.getUser().getEmail()))
                    .collect(Collectors.toList());

            for (int i = 0; i < Math.max(1, memberNames.size()); i++) {
                PDPage page = new PDPage(PDRectangle.A4);
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    float y = 780;

                    // Title
                    y = centeredBold(cs, y, "Form-3", 14);
                    y -= 4;
                    y = centeredBold(cs, y, "PROJECT WEEKLY STATUS MATRIX (FOR PROJECT MENTORS)", 12);
                    y -= 14;

                    // Header info in a box
                    float boxTop = y;
                    y -= 4;
                    y = boldLine(cs, y, "NAME OF STUDENT - " + (i + 1) + ": " + memberNames.get(i));
                    y -= 2;
                    y = boldLine(cs, y, "NAME OF PROJECT: " + safe(project.getTitle()));
                    y -= 2;
                    y = boldLine(cs, y, "OTHER TEAM MEMBERS:  " + otherMembers(memberNames, i));
                    y -= 4;
                    drawRect(cs, PAGE_LEFT, y, TABLE_WIDTH, boxTop - y);
                    y -= 8;

                    // Weekly Status Table
                    String[] weekHeaders = {"WEEK\n(TO-FROM)", "WORKING ON\nMODULE", "PROGRESS ACHIEVED", "COMMENTS", "MARKS\n(X / 10)"};
                    float[] weekWidths = {TABLE_WIDTH * 0.14f, TABLE_WIDTH * 0.16f, TABLE_WIDTH * 0.30f, TABLE_WIDTH * 0.26f, TABLE_WIDTH * 0.14f};
                    y = tableRow(cs, y, weekHeaders, weekWidths, 30, true);
                    // 14 empty rows for weeks
                    for (int r = 0; r < 14; r++) {
                        y = tableRow(cs, y, new String[]{"", "", "", "", ""}, weekWidths, 18, false);
                    }

                    // Summary row
                    String[] summaryHeaders = {"TOTAL\nWEEKS", "MODULE\nCOMPLETED\n(YES / NO)", "OVERALL PROGRESS\n(POOR / AVG / GOOD)", "OVERALL COMMENT\n(POOR / AVG / GOOD)", "PERCENTAGE\nMARKS ESTIMATE"};
                    y = tableRow(cs, y, summaryHeaders, weekWidths, 38, true);

                    y -= 14;
                    // Lab Coordinator signature box
                    drawRect(cs, PAGE_LEFT, y - 24, TABLE_WIDTH, 24);
                    cs.beginText();
                    cs.setFont(FONT_BOLD, 10);
                    cs.newLineAtOffset(PAGE_LEFT + 5, y - 16);
                    cs.showText("LAB COORDINATOR\u2019s remarks & Signature________________________________________");
                    cs.endText();
                    y -= 34;

                    // Notes
                    small(cs, PAGE_LEFT, y, "NOTE: 1. This form is to be maintained in a file by lab coordinators for student to track his/her progress.");
                    small(cs, PAGE_LEFT + 28, y - 12, "2. Lab coordinators must cross check and evaluate the PROGRESS ACHIEVED + DOCUMENTATION by student.");
                    small(cs, PAGE_LEFT + 28, y - 24, "3. The lab coordinator must evaluate student's work for every lab from a score of 10 points.");
                    small(cs, PAGE_LEFT + 28, y - 36, "4. The lab coordinator must compute average of these points at end of semester for percentage marks estimate.");
                }
            }

            return toBytes(doc);
        }
    }

    // ======================== HELPERS ========================

    private static float centeredBold(PDPageContentStream cs, float y, String text, float fontSize) throws IOException {
        float textWidth = FONT_BOLD.getStringWidth(text) / 1000 * fontSize;
        float x = (PDRectangle.A4.getWidth() - textWidth) / 2;
        cs.beginText();
        cs.setFont(FONT_BOLD, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
        return y - fontSize - 6;
    }

    private static float boldLine(PDPageContentStream cs, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(FONT_BOLD, 10);
        cs.newLineAtOffset(PAGE_LEFT, y);
        cs.showText(truncate(text, 90));
        cs.endText();
        return y - 14;
    }

    private static float labelLine(PDPageContentStream cs, float y, String label, String value) throws IOException {
        cs.beginText();
        cs.setFont(FONT_BOLD, 10);
        cs.newLineAtOffset(PAGE_LEFT, y);
        cs.showText(label + " ");
        cs.endText();

        float labelWidth = FONT_BOLD.getStringWidth(label + " ") / 1000 * 10;
        cs.beginText();
        cs.setFont(FONT_REGULAR, 10);
        cs.newLineAtOffset(PAGE_LEFT + labelWidth, y);
        cs.showText(truncate(value, 70));
        cs.endText();

        return y - 16;
    }

    private static float line(PDPageContentStream cs, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(FONT_REGULAR, 9);
        cs.newLineAtOffset(PAGE_LEFT + 5, y);
        cs.showText(truncate(text, 95));
        cs.endText();
        return y - 13;
    }

    private static float wrappedText(PDPageContentStream cs, float y, String text, int maxChars) throws IOException {
        String[] lines = safe(text).replace("\r", "").split("\n");
        for (String ln : lines) {
            for (String part : wrap(ln, maxChars)) {
                y = line(cs, y, part);
            }
        }
        return y;
    }

    private static float tableRow(PDPageContentStream cs, float y, String[] cells, float[] colWidths, float rowHeight, boolean isHeader) throws IOException {
        float x = PAGE_LEFT;
        float cellY = y - rowHeight;

        // Draw row rectangle cells
        for (float w : colWidths) {
            drawRect(cs, x, cellY, w, rowHeight);
            x += w;
        }

        // Write text in each cell
        x = PAGE_LEFT;
        PDFont font = isHeader ? FONT_BOLD : FONT_REGULAR;
        float fontSize = isHeader ? 8.5f : 9f;
        for (int i = 0; i < cells.length; i++) {
            String cellText = safe(cells[i]);
            String[] cellLines = cellText.split("\n");
            float textY = y - 10;
            for (String cl : cellLines) {
                cs.beginText();
                cs.setFont(font, fontSize);
                cs.newLineAtOffset(x + 3, textY);
                cs.showText(truncate(cl, (int) (colWidths[i] / 5)));
                cs.endText();
                textY -= 10;
            }
            x += colWidths[i];
        }

        return cellY;
    }

    private static void drawRect(PDPageContentStream cs, float x, float y, float width, float height) throws IOException {
        cs.addRect(x, y, width, height);
        cs.stroke();
    }

    private static void small(PDPageContentStream cs, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(FONT_REGULAR, 7);
        cs.newLineAtOffset(x, y);
        cs.showText(truncate(safe(text), 120));
        cs.endText();
    }

    private static String safe(String s) {
        return s == null ? "" : s.replaceAll("\\s+", " ").trim();
    }

    private static String orBlank(String s) {
        return (s == null || s.trim().isEmpty()) ? "________________________" : safe(s);
    }

    private static String orAuto(String override, String auto) {
        return (override == null || override.trim().isEmpty()) ? safe(auto) : safe(override);
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }

    private static String otherMembers(List<String> memberNames, int excludeIdx) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < memberNames.size(); i++) {
            if (i != excludeIdx) {
                if (sb.length() > 0) sb.append(", ");
                sb.append((i + 1) + ". " + memberNames.get(i));
            }
        }
        return sb.toString();
    }

    private static List<String> wrap(String text, int max) {
        if (text == null) return List.of("");
        if (text.length() <= max) return List.of(text);
        java.util.ArrayList<String> out = new java.util.ArrayList<>();
        int i = 0;
        while (i < text.length()) {
            int end = Math.min(i + max, text.length());
            out.add(text.substring(i, end));
            i = end;
        }
        return out;
    }

    private static byte[] toBytes(PDDocument doc) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            doc.save(baos);
            return baos.toByteArray();
        }
    }
}
