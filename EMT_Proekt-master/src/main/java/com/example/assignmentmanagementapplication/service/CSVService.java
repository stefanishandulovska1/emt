package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CSVService {

    @Autowired
    private UserService userService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private SubmissionService submissionService;

    // Export users to CSV
    public byte[] exportUsersToCSV() throws IOException {
        List<User> users = userService.findAll();
        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        String[] header = {"ID", "Име", "Презиме", "Email", "Улога", "Индекс", "Креирано"};
        csvWriter.writeNext(header);

        for (User user : users) {
            String[] data = {
                    user.getId() != null ? user.getId().toString() : "",
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole() != null ? user.getRole().toString() : "",
                    user.getIndexNumber() != null ? user.getIndexNumber() : "",
                    user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
            };
            csvWriter.writeNext(data);
        }
        csvWriter.close();
        return stringWriter.toString().getBytes();
    }

    // Export assignments results to CSV
    public byte[] exportAssignmentResultsToCSV(Long assignmentId) throws IOException {
        List<Submission> submissions = submissionService.findByAssignmentId(assignmentId);
        Assignment assignment = assignmentService.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));

        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        String[] header = {"Assignment", "Студент", "Email", "Индекс", "Оценка", "Коментари", "Поднесено", "Оценето"};
        csvWriter.writeNext(header);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

        for (Submission submission : submissions) {
            User student = submission.getStudent();
            String[] data = {
                    assignment.getTitle(),
                    student.getFullName(),
                    student.getEmail(),
                    student.getIndexNumber() != null ? student.getIndexNumber() : "",
                    submission.getGrade() != null ? submission.getGrade().toString() : "Не оценето",
                    submission.getComments() != null ? submission.getComments() : "",
                    submission.getSubmittedAt() != null ? submission.getSubmittedAt().format(fmt) : "",
                    submission.getGradedAt() != null ? submission.getGradedAt().format(fmt) : ""
            };
            csvWriter.writeNext(data);
        }
        csvWriter.close();
        return stringWriter.toString().getBytes();
    }

    // Export all results for subject to CSV
    public byte[] exportSubjectResultsToCSV(Long subjectId) throws IOException {
        List<Assignment> assignments = subjectService.findAssignmentsBySubjectId(subjectId);
        Subject subject = subjectService.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Предметот не е пронајден"));

        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        List<String> headerList = new ArrayList<>();
        headerList.add("Студент");
        headerList.add("Email");
        headerList.add("Индекс");

        for (Assignment assignment : assignments) {
            headerList.add(assignment.getTitle() + " (" + assignment.getMaxPoints() + "pt)");
        }
        headerList.add("Вкупно поени");
        headerList.add("Просек");
        csvWriter.writeNext(headerList.toArray(new String[0]));

        // Collect unique students from all submissions for this subject's assignments
        Set<User> studentSet = new HashSet<>();
        for (Assignment a : assignments) {
            List<Submission> subs = submissionService.findByAssignmentId(a.getId());
            for (Submission s : subs) {
                if (s.getStudent() != null) studentSet.add(s.getStudent());
            }
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

        for (User student : studentSet) {
            List<String> rowData = new ArrayList<>();
            rowData.add(student.getFullName());
            rowData.add(student.getEmail());
            rowData.add(student.getIndexNumber() != null ? student.getIndexNumber() : "");

            int totalPoints = 0;
            int gradedAssignments = 0;

            for (Assignment assignment : assignments) {
                Submission submission = submissionService.findByStudentAndAssignment(student.getId(), assignment.getId()).orElse(null);
                if (submission != null && submission.getGrade() != null) {
                    rowData.add(submission.getGrade().toString());
                    totalPoints += submission.getGrade();
                    gradedAssignments++;
                } else {
                    rowData.add("Не поднесено");
                }
            }

            rowData.add(String.valueOf(totalPoints));
            rowData.add(gradedAssignments > 0 ? String.format("%.2f", (double) totalPoints / gradedAssignments) : "0");
            csvWriter.writeNext(rowData.toArray(new String[0]));
        }
        csvWriter.close();
        return stringWriter.toString().getBytes();
    }

    // Import students from CSV
    public List<String> importStudentsFromCSV(MultipartFile file) throws IOException, CsvException {
        List<String> results = new ArrayList<>();

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV датотеката е празна");
                return results;
            }

            boolean isFirstRow = true;
            int successCount = 0;
            int errorCount = 0;

            for (String[] record : records) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }

                if (record.length < 4) {
                    results.add("Ред со недоволно колони: " + String.join(",", record));
                    errorCount++;
                    continue;
                }

                try {
                    User student = new User();
                    student.setFirstName(record[0].trim());
                    student.setLastName(record[1].trim());
                    student.setEmail(record[2].trim());
                    student.setIndexNumber(record[3].trim());
                    student.setRole(UserRole.СТУДЕНТ);
                    // Ако имаш password поле додади, инаку избриши ја оваа линија
                    // student.setPassword("defaultPassword123");

                    userService.save(student);
                    successCount++;

                } catch (Exception e) {
                    results.add("Грешка при додавање на студент " + record[0] + " " + record[1] + ": " + e.getMessage());
                    errorCount++;
                }
            }

            results.add("Успешно додадени: " + successCount + " студенти");
            results.add("Грешки: " + errorCount);
        }
        return results;
    }

    // Import grades from CSV
    public List<String> importGradesFromCSV(Long assignmentId, MultipartFile file) throws IOException, CsvException {
        List<String> results = new ArrayList<>();
        Assignment assignment = assignmentService.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV датотеката е празна");
                return results;
            }

            boolean isFirstRow = true;
            int successCount = 0;
            int errorCount = 0;

            for (String[] record : records) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }

                if (record.length < 3) {
                    results.add("Ред со недоволно колони: " + String.join(",", record));
                    errorCount++;
                    continue;
                }

                try {
                    String studentEmail = record[0].trim();
                    Integer grade = Integer.parseInt(record[1].trim());
                    String comments = record.length > 2 ? record[2].trim() : "";

                    var student = userService.findByEmail(studentEmail);
                    if (student.isEmpty()) {
                        results.add("Студентот не е пронајден: " + studentEmail);
                        errorCount++;
                        continue;
                    }

                    var submission = submissionService.findByStudentAndAssignment(student.get().getId(), assignmentId);
                    if (submission.isPresent()) {
                        submissionService.gradeSubmission(submission.get().getId(), grade, comments);
                        successCount++;
                    } else {
                        results.add("Не е пронајдено поднесување за студентот: " + studentEmail);
                        errorCount++;
                    }

                } catch (NumberFormatException e) {
                    results.add("Невалидна оценка во ред: " + String.join(",", record));
                    errorCount++;
                } catch (Exception e) {
                    results.add("Грешка при обработка на ред: " + String.join(",", record) + " - " + e.getMessage());
                    errorCount++;
                }
            }
            results.add("Успешно ажурирани: " + successCount + " оценки");
            results.add("Грешки: " + errorCount);
        }
        return results;
    }
}
