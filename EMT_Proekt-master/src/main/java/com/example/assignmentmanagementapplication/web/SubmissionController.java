package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.repository.AssignmentRepository;
import com.example.assignmentmanagementapplication.repository.UserRepository;
import com.example.assignmentmanagementapplication.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/submissions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;


    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        List<Submission> submissions = submissionService.findAll();
        if (submissions == null) submissions = new ArrayList<>();
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(@Valid @RequestBody Submission submission) {
        try {
            Submission saved = submissionService.save(submission);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Submission> updateSubmission(@PathVariable Long id, @Valid @RequestBody Submission submissionDetails) {
        try {
            Submission updated = submissionService.update(id, submissionDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Integer grade,
            @RequestParam(required = false) String comments) {
        try {
            Submission graded = submissionService.gradeSubmission(id, grade, comments);
            return ResponseEntity.ok(graded);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        try {
            submissionService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Submission>> getSubmissionsByStudent(@PathVariable Long studentId) {
        List<Submission> submissions = submissionService.findByStudentId(studentId);
        if (submissions == null) submissions = new ArrayList<>();
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        List<Submission> submissions = submissionService.findByAssignmentId(assignmentId);
        if (submissions == null) submissions = new ArrayList<>();
        return ResponseEntity.ok(submissions);
    }
    @PostMapping("/upload/{assignmentId}/student/{studentId}")
    public ResponseEntity<?> uploadSubmissionFile(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "comments", required = false) String comments) {

        Optional<Assignment> assignmentOpt = assignmentRepository.findById(assignmentId);
        Optional<User> studentOpt = userRepository.findById(studentId);

        if (assignmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Assignment not found");
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }

        Assignment assignment = assignmentOpt.get();
        User student = studentOpt.get();

        if (assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            return ResponseEntity.badRequest().body("Рокот за поднесување е истечен");
        }

        if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body("Само PDF датотеки се дозволени");
        }

        try {
            Path uploadDir = Paths.get("uploads/submissions");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String filename = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
                    + "_" + java.util.UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            Optional<Submission> existing = submissionService.findByStudentAndAssignment(student.getId(), assignment.getId());

            Submission submission;

            if (existing.isPresent()) {
                submission = existing.get();
            } else {
                submission = new Submission();
                submission.setAssignment(assignment);
                submission.setStudent(student);
                submission.setSubmittedAt(LocalDateTime.now());
            }

            ObjectMapper mapper = new ObjectMapper();
            List<String> filesList;

            if (submission.getSubmissionFiles() != null) {
                filesList = mapper.readValue(submission.getSubmissionFiles(), List.class);
            } else {
                filesList = new ArrayList<>();
            }

            filesList.clear(); // clear existing to allow single file only; adjust if multi allowed
            filesList.add(filePath.toString());

            submission.setSubmissionFiles(mapper.writeValueAsString(filesList));
            submission.setComments(comments);
            submissionService.save(submission);

            return ResponseEntity.ok("Поднесувањето е успешно зачувано");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Грешка при зачувување на поднесувањето");
        }
    }
}
