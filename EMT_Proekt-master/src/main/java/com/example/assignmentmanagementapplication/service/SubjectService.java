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
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;

    public List<Subject> findAll() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> findById(Long id) {
        return subjectRepository.findById(id);
    }

    public Subject save(Subject subject) {
        // Проверка дали кодот е зафатен од друг предмет
        if (subjectRepository.existsByCode(subject.getCode())) {
            throw new RuntimeException("Предмет со овој код веќе постои: " + subject.getCode());
        }
        return subjectRepository.save(subject);
    }

    public Subject update(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предметот не е пронајден со ID: " + id));

        // Проверка дали кодот е зафатен од друг предмет
        if (!subject.getCode().equals(subjectDetails.getCode()) &&
                subjectRepository.existsByCode(subjectDetails.getCode())) {
            throw new RuntimeException("Предмет со овој код веќе постои: " + subjectDetails.getCode());
        }

        subject.setCode(subjectDetails.getCode());
        subject.setName(subjectDetails.getName());
        subject.setSemester(subjectDetails.getSemester());
        subject.setYear(subjectDetails.getYear());
        subject.setProfessor(subjectDetails.getProfessor());

        return subjectRepository.save(subject);
    }

    public void delete(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Предметот не е пронајден со ID: " + id);
        }
        subjectRepository.deleteById(id);
    }

    public List<Assignment> findAssignmentsBySubjectId(Long subjectId) {
        return assignmentRepository.findBySubjectId(subjectId);
    }

    public List<Subject> search(String searchTerm) {
        return subjectRepository.findBySearchTerm(searchTerm);
    }

    public List<Subject> findBySemester(String semester) {
        return subjectRepository.findBySemester(semester);
    }

    public Page<Subject> findPaginated(Pageable pageable) {
        return subjectRepository.findAll(pageable);
    }

    public long count() {
        return subjectRepository.count();
    }

    public List<Subject> findByYear(Integer year) {
        return subjectRepository.findByYear(year);
    }

    public Double getAverageGradeForSubject(Long subjectId) {
        return assignmentRepository.getAverageGradeForSubject(subjectId);
    }

    public long countAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.countBySubjectId(subjectId);
    }
}