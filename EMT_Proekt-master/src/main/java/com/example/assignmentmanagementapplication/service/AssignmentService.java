package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.repository.AssignmentRepository;
import com.example.assignmentmanagementapplication.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public List<Assignment> findAll() {
        return assignmentRepository.findAll();
    }

    public Optional<Assignment> findById(Long id) {
        return assignmentRepository.findById(id);
    }

    public Assignment save(Assignment assignment) {
        // Проверка дали предметот постои
        if (assignment.getSubject() != null && assignment.getSubject().getId() != null) {
            Subject subject = subjectRepository.findById(assignment.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Предметот не е пронајден"));
            assignment.setSubject(subject);
        }
        return assignmentRepository.save(assignment);
    }

    public Assignment update(Long id, Assignment assignmentDetails) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment не е пронајден со ID: " + id));

        assignment.setTitle(assignmentDetails.getTitle());
        assignment.setDescription(assignmentDetails.getDescription());
        assignment.setMaxPoints(assignmentDetails.getMaxPoints());
        assignment.setDueDate(assignmentDetails.getDueDate());
        assignment.setMaterialFiles(assignmentDetails.getMaterialFiles());

        if (assignmentDetails.getSubject() != null && assignmentDetails.getSubject().getId() != null) {
            Subject subject = subjectRepository.findById(assignmentDetails.getSubject().getId())
                    .orElseThrow(() -> new RuntimeException("Предметот не е пронајден"));
            assignment.setSubject(subject);
        }

        return assignmentRepository.save(assignment);
    }

    public void delete(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Assignment не е пронајден со ID: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    public List<Assignment> findBySubjectId(Long subjectId) {
        return assignmentRepository.findBySubjectId(subjectId);
    }

    public List<Assignment> findBySemester(String semester) {
        return assignmentRepository.findBySemester(semester);
    }

    public List<Assignment> search(String searchTerm) {
        return assignmentRepository.findBySearchTerm(searchTerm);
    }

    public Page<Assignment> findPaginated(Pageable pageable) {
        return assignmentRepository.findAll(pageable);
    }

    public long count() {
        return assignmentRepository.count();
    }

    public long countBySemester(String semester) {
        return assignmentRepository.countBySemester(semester);
    }

    public Double getAverageGrade(Long assignmentId) {
        return assignmentRepository.getAverageGradeForAssignment(assignmentId);
    }

    public long countSubmissionsByAssignment(Long assignmentId) {
        return assignmentRepository.countSubmissionsByAssignmentId(assignmentId);
    }
}