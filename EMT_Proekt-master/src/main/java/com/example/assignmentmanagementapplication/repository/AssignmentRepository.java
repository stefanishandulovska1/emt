package com.example.assignmentmanagementapplication.repository;

import com.example.assignmentmanagementapplication.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findBySubjectId(Long subjectId);

    @Query("SELECT a FROM Assignment a JOIN a.subject s WHERE s.semester = :semester")
    List<Assignment> findBySemester(@Param("semester") String semester);

    @Query("SELECT a FROM Assignment a WHERE a.title LIKE %:searchTerm% OR a.description LIKE %:searchTerm%")
    List<Assignment> findBySearchTerm(@Param("searchTerm") String searchTerm);

    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.subject.semester = :semester")
    long countBySemester(@Param("semester") String semester);

    @Query("SELECT AVG(s.grade) FROM Submission s WHERE s.assignment.id = :assignmentId AND s.grade IS NOT NULL")
    Double getAverageGradeForAssignment(@Param("assignmentId") Long assignmentId);

    @Query("SELECT AVG(s.grade) FROM Submission s JOIN s.assignment a WHERE a.subject.id = :subjectId AND s.grade IS NOT NULL")
    Double getAverageGradeForSubject(@Param("subjectId") Long subjectId);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.id = :assignmentId")
    long countSubmissionsByAssignmentId(@Param("assignmentId") Long assignmentId);

    long countBySubjectId(Long subjectId);
}