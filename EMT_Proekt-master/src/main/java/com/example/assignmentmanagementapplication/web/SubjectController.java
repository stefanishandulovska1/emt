package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.dto.SubjectDTO;
import com.example.assignmentmanagementapplication.model.Subject;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        List<Subject> subjects = subjectService.findAll();
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        return subjectService.findById(id)
                .map(subject -> ResponseEntity.ok(convertToDTO(subject)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody SubjectDTO subjectDTO) {
        try {
            Subject subject = convertToEntity(subjectDTO);
            Subject savedSubject = subjectService.save(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedSubject));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectDTO subjectDTO) {
        try {
            Subject subjectDetails = convertToEntity(subjectDTO);
            subjectDetails.setId(id); // сигурно сетирај го ID-то!
            Subject updatedSubject = subjectService.update(id, subjectDetails);
            return ResponseEntity.ok(convertToDTO(updatedSubject));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByYear(@PathVariable Integer year) {
        List<Subject> subjects = subjectService.findByYear(year);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsBySemester(@PathVariable String semester) {
        List<Subject> subjects = subjectService.findBySemester(semester);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<SubjectDTO>> getSubjectsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Subject> subjects = subjectService.findPaginated(pageable);
        Page<SubjectDTO> subjectDTOs = subjects.map(this::convertToDTO);
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SubjectDTO>> searchSubjects(@RequestParam String term) {
        List<Subject> subjects = subjectService.search(term);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getSubjectsCount() {
        return ResponseEntity.ok(subjectService.count());
    }

    // ========== DTO <-> Entity конверзии ==========

    private SubjectDTO convertToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setSemester(subject.getSemester());
        dto.setYear(subject.getYear());
        dto.setProfessor(subject.getProfessor()); // direct string mapping
        dto.setAssignmentCount(subject.getAssignments() != null ? subject.getAssignments().size() : 0);
        return dto;
    }

    private Subject convertToEntity(SubjectDTO dto) {
        Subject subject = new Subject();
        subject.setId(dto.getId());
        subject.setCode(dto.getCode());
        subject.setName(dto.getName());
        subject.setSemester(dto.getSemester());
        subject.setYear(dto.getYear());
        subject.setProfessor(dto.getProfessor()); // direct string mapping
        return subject;
    }
}
