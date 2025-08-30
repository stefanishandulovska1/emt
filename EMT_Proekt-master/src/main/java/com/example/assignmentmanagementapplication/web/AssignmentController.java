package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.dto.AssignmentDTO;
import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.service.AssignmentService;
import com.example.assignmentmanagementapplication.service.FileStorageService;
import com.example.assignmentmanagementapplication.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "http://localhost:3000")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments() {
        List<Assignment> assignments = assignmentService.findAll();
        List<AssignmentDTO> assignmentDTOs = assignments != null
                ? assignments.stream().map(this::convertToDTO).collect(Collectors.toList())
                : new ArrayList<>();
        return ResponseEntity.ok(assignmentDTOs);
    }


    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable Long id) {
        return assignmentService.findById(id)
                .map(assignment -> ResponseEntity.ok(convertToDTO(assignment)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@Valid @RequestBody AssignmentDTO assignmentDTO) {
        try {
            Assignment assignment = convertToEntity(assignmentDTO);
            Assignment savedAssignment = assignmentService.save(assignment);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedAssignment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/files")
    public ResponseEntity<String> uploadFiles(@PathVariable Long id, @RequestParam("files") MultipartFile[] files) {
        try {
            Assignment assignment = assignmentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    fileStorageService.storeFile(file, assignment);
                }
            }

            return ResponseEntity.ok("Датотеките се успешно прикачени");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Грешка при прикачување: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable Long id, @Valid @RequestBody AssignmentDTO assignmentDTO) {
        try {
            Assignment assignmentDetails = convertToEntity(assignmentDTO);
            Assignment updatedAssignment = assignmentService.update(id, assignmentDetails);
            return ResponseEntity.ok(convertToDTO(updatedAssignment));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        try {
            // Прво избриши ги сите датотеки
            fileStorageService.deleteFilesByAssignmentId(id);
            // Потоа избриши го assignment-от
            assignmentService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<AssignmentDTO>> searchAssignments(@RequestParam String term) {
        List<Assignment> assignments = assignmentService.search(term);
        List<AssignmentDTO> assignmentDTOs = assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignmentDTOs);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsBySubject(@PathVariable Long subjectId) {
        List<Assignment> assignments = assignmentService.findBySubjectId(subjectId);
        List<AssignmentDTO> assignmentDTOs = assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignmentDTOs);
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsBySemester(@PathVariable String semester) {
        List<Assignment> assignments = assignmentService.findBySemester(semester);
        List<AssignmentDTO> assignmentDTOs = assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignmentDTOs);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<AssignmentDTO>> getAssignmentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<Assignment> assignments = assignmentService.findPaginated(pageable);
        Page<AssignmentDTO> assignmentDTOs = assignments.map(this::convertToDTO);
        return ResponseEntity.ok(assignmentDTOs);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getAssignmentsCount() {
        return ResponseEntity.ok(assignmentService.count());
    }

    // Helper methods
    private AssignmentDTO convertToDTO(Assignment assignment) {
        AssignmentDTO dto = new AssignmentDTO();
        dto.setId(assignment.getId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setPoints(assignment.getMaxPoints()); // Mapping maxPoints to points
        dto.setRequirements(assignment.getMaterialFiles()); // Using materialFiles as requirements

        if (assignment.getSubject() != null) {
            dto.setSubjectId(assignment.getSubject().getId());
            dto.setSubjectName(assignment.getSubject().getName());
            dto.setSubjectCode(assignment.getSubject().getCode());
        }

        dto.setSubmissionCount(assignment.getSubmissions() != null ? assignment.getSubmissions().size() : 0);
        dto.setAverageGrade(assignmentService.getAverageGrade(assignment.getId()));

        return dto;
    }

    private Assignment convertToEntity(AssignmentDTO dto) {
        Assignment assignment = new Assignment();
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setMaxPoints(dto.getPoints()); // Mapping points to maxPoints
        assignment.setMaterialFiles(dto.getRequirements()); // Using requirements as materialFiles
        assignment.setDueDate(dto.getDueDate());

        if (dto.getSubjectId() != null) {
            Subject subject = new Subject();
            subject.setId(dto.getSubjectId());
            assignment.setSubject(subject);
        }

        return assignment;
    }
}