import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search, Plus, Edit, Trash2, Download,
    Users, BookOpen, Award, BarChart3
} from 'lucide-react';
import apiService from '../services/api';

const AssignmentManagementSystem = () => {
    const [activeTab, setActiveTab] = useState('subjects');
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const { user, logout } = useAuth();

    const professors = users.filter(u => u.role === 'НАСТАВНИК');
    const assistants = users.filter(u => u.role === 'АСИСТЕНТ');

    const [userAssignments, setUserAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [submissionComment, setSubmissionComment] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [professorSubmissions, setProfessorSubmissions] = useState([]);
    const [gradingData, setGradingData] = useState({});

    const [subjectForm, setSubjectForm] = useState({
        code: '',
        name: '',
        semester: '',
        year: 1,
        professor: '',
        assistant: ''
    });

    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        points: '1',
        requirements: '',
        subjectId: '',
        dueDate: '',
    });

    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'СТУДЕНТ',
        indexNumber: ''
    });

    const [editingItem, setEditingItem] = useState(null);
    const [searchTerms, setSearchTerms] = useState({
        subjects: '',
        assignments: '',
        users: ''
    });

    const subjectFormRef = useRef(null);
    const assignmentFormRef = useRef(null);
    const userFormRef = useRef(null);

    // Fetch functions
    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await apiService.getSubjects();
            setSubjects(data);
        } catch {
            alert('Грешка при вчитување предмети');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAssignments();
            setAssignments(data);
        } catch {
            alert('Грешка при вчитување задачи');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await apiService.getUsers();
            setUsers(data);
        } catch {
            alert('Грешка при вчитување корисници');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAssignments = async () => {
        try {
            const data = await apiService.getUserAssignments();
            setUserAssignments(data);
        } catch {
            alert('Грешка при вчитување оценки');
        }
    };

    useEffect(() => {
        fetchSubjects();
        fetchAssignments();
        fetchUsers();
        fetchUserAssignments();
    }, []);

    // Student: fetch own submissions for assignments
    useEffect(() => {
        if (user?.role === 'СТУДЕНТ' && user?.id) {
            apiService.getSubmissionsByStudent(user.id)
                .then(setStudentSubmissions)
                .catch(console.error);
        }
    }, [assignments, user]);

    // Staff: fetch assignment submissions
    const fetchSubmissionsForAssignment = async (assignmentId) => {
        try {
            const subs = await apiService.getSubmissionsByAssignment(assignmentId);
            setProfessorSubmissions(subs);
            setSelectedAssignmentId(assignmentId);
        } catch {
            alert('Грешка при вчитување на поднесувања');
        }
    };

    // Subject CRUD
    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да додавате или уредувате предмети');
            return;
        }
        try {
            setLoading(true);
            if (editingItem) {
                await apiService.updateSubject(editingItem, subjectForm);
                alert('Предметот е успешно ажуриран!');
            } else {
                await apiService.createSubject(subjectForm);
                alert('Предметот е успешно додаден!');
            }
            setSubjectForm({ code: '', name: '', semester: '', year: 1, professor: '', assistant: '' });
            setEditingItem(null);
            fetchSubjects();
        } catch {
            alert('Грешка при зачувување предмет');
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectEdit = (subject) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да уредувате предмети');
            return;
        }
        setSubjectForm({
            code: subject.code || '',
            name: subject.name || '',
            semester: subject.semester || '',
            year: subject.year || 1,
            professor: subject.professor || '',
            assistant: subject.assistant || ''
        });
        setEditingItem(subject.id);
        if (subjectFormRef.current) subjectFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubjectDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да бришете предмети');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете предмет?')) return;
        try {
            setLoading(true);
            await apiService.deleteSubject(id);
            alert('Предметот е успешно избришен!');
            fetchSubjects();
        } catch {
            alert('Грешка при бришење предмет');
        } finally {
            setLoading(false);
        }
    };

    // Assignment CRUD
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да додавате или уредувате задачи');
            return;
        }
        try {
            setLoading(true);
            const data = {
                ...assignmentForm,
                points: assignmentForm.points === "" ? 1 : Number(assignmentForm.points),
                subjectId: Number(assignmentForm.subjectId),
                dueDate: assignmentForm.dueDate
                    ? (assignmentForm.dueDate.length === 16 ? assignmentForm.dueDate + ':00' : assignmentForm.dueDate)
                    : null,
            };
            if (editingItem) {
                await apiService.updateAssignment(editingItem, data);
                alert('Задачата е успешно ажурирана!');
            } else {
                await apiService.createAssignment(data);
                alert('Задачата е успешно додадена!');
            }
            setAssignmentForm({ title: '', description: '', points: '1', requirements: '', subjectId: '', dueDate: '' });
            setEditingItem(null);
            fetchAssignments();
        } catch {
            alert('Грешка при зачувување задача');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentEdit = (assignment) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да уредувате задачи');
            return;
        }
        setAssignmentForm(assignment);
        setEditingItem(assignment.id);
        if (assignmentFormRef.current) assignmentFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAssignmentDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да бришете задачи');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете задача?')) return;
        try {
            setLoading(true);
            await apiService.deleteAssignment(id);
            alert('Задачата е успешно избришена!');
            fetchAssignments();
        } catch {
            alert('Грешка при бришење задача');
        } finally {
            setLoading(false);
        }
    };

    // Users CRUD
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да додавате или уредувате корисници');
            return;
        }
        try {
            setLoading(true);
            if (editingItem) {
                await apiService.updateUser(editingItem, userForm);
                alert('Корисникот е успешно ажуриран!');
            } else {
                await apiService.createUser(userForm);
                alert('Корисникот е успешно додаден!');
            }
            setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
            setEditingItem(null);
            fetchUsers();
        } catch {
            alert('Грешка при зачувување корисник');
        } finally {
            setLoading(false);
        }
    };

    const handleUserEdit = (userData) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да уредувате корисници');
            return;
        }
        setUserForm(userData);
        setEditingItem(userData.id);
        if (userFormRef.current) userFormRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleUserDelete = async (id) => {
        if (!['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) {
            alert('Немате овластување да бришете корисници');
            return;
        }
        if (!window.confirm('Дали сте сигурни дека сакате да избришете корисник?')) return;
        try {
            setLoading(true);
            await apiService.deleteUser(id);
            alert('Корисникот е успешно избришен!');
            fetchUsers();
        } catch {
            alert('Грешка при бришење корисник');
        } finally {
            setLoading(false);
        }
    };

    // Search
    const handleSearch = async (type, term) => {
        if (!term.trim()) {
            if (type === 'subjects') fetchSubjects();
            if (type === 'assignments') fetchAssignments();
            if (type === 'users') fetchUsers();
            return;
        }
        try {
            if (type === 'subjects') setSubjects(await apiService.searchSubjects(term));
            if (type === 'assignments') setAssignments(await apiService.searchAssignments(term));
            if (type === 'users') setUsers(await apiService.searchUsers(term));
        } catch {
            alert(`Грешка при пребарување ${type}`);
        }
    };

    // Export helpers
    const exportToCSV = (data, filename) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj =>
            Object.values(obj).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
        );
        const BOM = "\uFEFF";
        const csv = BOM + [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToJSON = (data, filename) => {
        if (!data.length) return;
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter helpers
    const getFilteredSubjects = () => {
        if (!searchTerms.subjects) return subjects;
        return subjects.filter(s =>
            (s.name && s.name.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
            (s.code && s.code.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
            (s.professor && s.professor.toLowerCase().includes(searchTerms.subjects.toLowerCase()))
        );
    };

    const getFilteredAssignments = () => {
        if (!searchTerms.assignments) return assignments;
        return assignments.filter(a =>
            (a.title && a.title.toLowerCase().includes(searchTerms.assignments.toLowerCase())) ||
            (a.description && a.description.toLowerCase().includes(searchTerms.assignments.toLowerCase()))
        );
    };

    const getFilteredUsers = () => {
        if (!searchTerms.users) return users;
        return users.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.lastName && u.lastName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
            (u.indexNumber && u.indexNumber.toLowerCase().includes(searchTerms.users.toLowerCase()))
        );
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2 text-gray-600">Се вчитува...</span>
        </div>
    );

    // ------------------ RETURN ------------------
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
            <div className="container mx-auto px-4 pt-6 flex justify-end items-center">
                {user && user.role === 'СТУДЕНТ' && (
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full px-4 py-2 text-base font-semibold shadow mr-2">
                        Индекс: {user.indexNumber || 'Нема внесен број'}
                    </span>
                )}
                {user && (
                    <button
                        onClick={logout}
                        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-full px-5 py-2 text-base font-semibold shadow transition"
                    >
                        Одјави се
                    </button>
                )}
            </div>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center">
                        <h1 className="text-4xl font-bold mb-2">Assignment Management System</h1>
                        <p className="text-blue-100">Систем за управување со задачи и проекти</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                    <div className="flex bg-gray-50 border-b">
                        {[
                            { key: 'subjects', label: 'Предмети', icon: BookOpen },
                            { key: 'assignments', label: 'Задачи', icon: Award },
                            { key: 'users', label: 'Корисници', icon: Users },
                            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
                                    activeTab === key
                                        ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveTab(key)}
                                disabled={loading}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {loading && <LoadingSpinner />}

                    {/* SUBJECTS TAB */}
                    {!loading && activeTab === 'subjects' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{subjects.length}</div>
                                    <div>Вкупно Предмети</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{new Date().getFullYear()}</div>
                                    <div>Тековна Година</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                            </div>
                            {/* Subject Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={subjectFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај предмет' : 'Додај предмет'}
                                    </h3>
                                    <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" placeholder="Код на предмет" value={subjectForm.code}
                                               onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} required
                                               className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        <input type="text" placeholder="Име на предмет" value={subjectForm.name}
                                               onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} required
                                               className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        <input type="text" placeholder="Семестар (e.g., 2024/1)" value={subjectForm.semester}
                                               onChange={e => setSubjectForm({ ...subjectForm, semester: e.target.value })} required
                                               className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        <select value={subjectForm.year} onChange={e => setSubjectForm({ ...subjectForm, year: Number(e.target.value) })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            {[1, 2, 3, 4].map(y => (
                                                <option key={y} value={y}>{y}. година</option>
                                            ))}
                                        </select>
                                        <select required value={subjectForm.professor} onChange={e => setSubjectForm({ ...subjectForm, professor: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="">Избери професор</option>
                                            {professors.map(prof => (
                                                <option key={prof.id} value={`${prof.firstName} ${prof.lastName}`}>
                                                    {prof.firstName} {prof.lastName} ({prof.email})
                                                </option>
                                            ))}
                                        </select>
                                        <select value={subjectForm.assistant} onChange={e => setSubjectForm({ ...subjectForm, assistant: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="">Избери асистент</option>
                                            {assistants.map(ast => (
                                                <option key={ast.id} value={`${ast.firstName} ${ast.lastName}`}>
                                                    {ast.firstName} {ast.lastName} ({ast.email})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex space-x-2 md:col-span-3">
                                            <button type="submit" className="flex-1 bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 transition">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button type="button" onClick={() => {
                                                    setEditingItem(null);
                                                    setSubjectForm({ code: '', name: '', semester: '', year: 1, professor: '', assistant: '' });
                                                }}
                                                        className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600 transition"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                            {/* Search and Export */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај предмети..."
                                        value={searchTerms.subjects}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, subjects: e.target.value });
                                            handleSearch('subjects', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => exportToCSV(subjects, 'predmeti')}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                                >
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button
                                    onClick={() => exportToJSON(subjects, 'predmeti')}
                                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2"
                                >
                                    <Download size={16} /> <span>JSON</span>
                                </button>
                                {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                    <>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'СТУДЕНТ'), 'studenti')}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                        >Студенти CSV</button>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'НАСТАВНИК'), 'profesori')}
                                            className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800"
                                        >Професори CSV</button>
                                        <button
                                            onClick={() => exportToCSV(users.filter(u => u.role === 'АСИСТЕНТ'), 'asistenti')}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                                        >Асистенти CSV</button>
                                    </>
                                )}
                            </div>
                            {/* Subjects List */}
                            <div className="grid gap-4">
                                {getFilteredSubjects().map(subject => (
                                    <div key={subject.id} className="bg-white rounded shadow p-6 border-l-4 border-blue-500">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold">{subject.name}</h3>
                                                <p className="text-blue-600 font-medium">{subject.code}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{subject.semester}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div><b>Година:</b> {subject.year}</div>
                                            <div><b>Професор:</b> {subject.professor || 'Не е внесено'}</div>
                                            <div><b>Асистент:</b> {subject.assistant || 'Не е внесено'}</div>
                                            <div><b>Задачи:</b> {subject.assignmentCount || 0}</div>
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                                <>
                                                    <button onClick={() => handleSubjectEdit(subject)} className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 space-x-1">
                                                        <Edit size={16} /><span>Уреди</span>
                                                    </button>
                                                    <button onClick={() => handleSubjectDelete(subject.id)} className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 space-x-1">
                                                        <Trash2 size={16} /><span>Избриши</span>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const students = await apiService.getStudentsForSubject(subject.id);
                                                            exportToCSV(students, `studenti_predmet_${subject.code}`);
                                                        }}
                                                        className="flex items-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 space-x-1"
                                                    >
                                                        <Download size={16} /><span>Студенти CSV</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {getFilteredSubjects().length === 0 && (
                                    <div className="text-center py-8 text-gray-500">Нема предмети</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ASSIGNMENTS TAB */}
                    {!loading && activeTab === 'assignments' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{userAssignments.filter(ua => !ua.isGraded).length}</div>
                                    <div>Во Тек</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{userAssignments.filter(ua => ua.isGraded).length}</div>
                                    <div>Завршени</div>
                                </div>
                            </div>
                            {/* Assignment Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={assignmentFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај задача' : 'Додај задача'}
                                    </h3>
                                    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Наслов" value={assignmentForm.title}
                                                   onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                                            <input type="number" placeholder="Број поени" value={assignmentForm.points} min={1} max={100}
                                                   onChange={e => setAssignmentForm({ ...assignmentForm, points: e.target.value === '' ? '1' : e.target.value })} required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                        <textarea
                                            placeholder="Краток опис"
                                            value={assignmentForm.description}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            rows={3}
                                        />
                                        <textarea
                                            placeholder="Подетални барања"
                                            value={assignmentForm.requirements}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, requirements: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            rows={4}
                                        />
                                        <input
                                            type="datetime-local"
                                            value={assignmentForm.dueDate || ''}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                        <select
                                            value={assignmentForm.subjectId}
                                            onChange={e => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Избери предмет</option>
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex space-x-2">
                                            <button type="submit" className="flex-1 bg-purple-500 text-white rounded-lg p-3 hover:bg-purple-600">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setEditingItem(null); setAssignmentForm({ title: '', description: '', points: '1', requirements: '', subjectId: '', dueDate: '' }); }}
                                                    className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Search and export */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај задачи..."
                                        value={searchTerms.assignments}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, assignments: e.target.value });
                                            handleSearch('assignments', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button onClick={() => exportToCSV(assignments, 'zadachi')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button onClick={() => exportToJSON(assignments, 'zadachi')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>JSON</span>
                                </button>
                            </div>

                            {/* Assignments List */}
                            <div className="grid gap-4">
                                {getFilteredAssignments().map((assignment) => {
                                    const submission = studentSubmissions.find(s => s.assignment.id === assignment.id);
                                    const dueDate = new Date(assignment.dueDate);
                                    const now = new Date();

                                    return (
                                        <div key={assignment.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="text-xl font-bold text-purple-900">{assignment.title}</h4>
                                                    <div className="text-purple-800">{assignment.subjectCode} - {assignment.subjectName}</div>
                                                </div>
                                                <div>
                                                    <span className="bg-purple-200 px-3 py-1 rounded-full text-purple-800 text-sm font-bold mr-2">{assignment.points} поени</span>
                                                    {assignment.averageGrade && (
                                                        <span className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm font-bold">
                                                            Просек: {assignment.averageGrade.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {assignment.description && <div className="mt-2">{assignment.description}</div>}
                                            {assignment.requirements && (
                                                <div className="mt-2 bg-gray-50 rounded p-3 text-sm">
                                                    <strong>Барања:</strong> {assignment.requirements}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500 mt-2 mb-1">
                                                Краен рок: {dueDate.toLocaleString('mk-MK')}
                                            </div>
                                            {/* === Student upload form & display === */}
                                            {user?.role === "СТУДЕНТ" && (
                                                <>
                                                    {now < dueDate ? (
                                                        <form
                                                            onSubmit={async e => {
                                                                e.preventDefault();
                                                                if (!submissionFile) {
                                                                    alert('Ве молиме изберете PDF датотека');
                                                                    return;
                                                                }
                                                                if (submissionFile.type !== 'application/pdf') {
                                                                    alert('Само PDF датотеки се дозволени');
                                                                    return;
                                                                }
                                                                setLoading(true);
                                                                try {
                                                                    await apiService.uploadSubmissionFile(
                                                                        assignment.id, user.id, submissionFile, submissionComment
                                                                    );
                                                                    alert('Поднесувањето е успешно прикачено');
                                                                    const updatedSubs = await apiService.getSubmissionsByStudent(user.id);
                                                                    setStudentSubmissions(updatedSubs);
                                                                    setSubmissionFile(null);
                                                                    setSubmissionComment('');
                                                                } catch {
                                                                    alert('Грешка при прикачување');
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            className="mb-2"
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                onChange={e => setSubmissionFile(e.target.files[0])}
                                                                className="block mb-2"
                                                            />
                                                            <textarea
                                                                placeholder="Коментари..."
                                                                value={submissionComment}
                                                                onChange={e => setSubmissionComment(e.target.value)}
                                                                className="w-full p-2 border mt-2 mb-2"
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
                                                                disabled={loading}
                                                            >
                                                                {submission ? 'Ажурирај Поднесување' : 'Поднеси Assignment'}
                                                            </button>
                                                        </form>
                                                    ) : (
                                                        <p className="text-red-600">Рокот за поднесување е истечен.</p>
                                                    )}
                                                    {submission && (
                                                        <div className="mt-2 p-2 border rounded">
                                                            <p><strong>Вашето поднесување:</strong></p>
                                                            <p>Коментари: {submission.comments || 'Нема'}</p>
                                                            {submission.submissionFiles && (
                                                                <a
                                                                    href={submission.submissionFiles}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 underline"
                                                                >
                                                                    Прегледај PDF
                                                                </a>
                                                            )}
                                                            {submission.grade !== null && <p>Оценка: {submission.grade}</p>}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {/* Staff: see submissions button */}
                                            {(['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role)) && (
                                                <button
                                                    onClick={() => fetchSubmissionsForAssignment(assignment.id)}
                                                    className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Види поднесувања
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {getFilteredAssignments().length === 0 && (
                                    <div className="text-center text-gray-500 py-8">Нема задачи</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {!loading && activeTab === 'users' && (
                        <div className="p-8">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.length}</div>
                                    <div>Вкупно Корисници</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.filter(u => u.role === 'СТУДЕНТ').length}</div>
                                    <div>Студенти</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                    <div className="text-3xl font-bold">{users.filter(u => u.role === 'НАСТАВНИК' || u.role === 'АСИСТЕНТ').length}</div>
                                    <div>Наставници/Асистенти</div>
                                </div>
                            </div>
                            {/* User Form - samo staff */}
                            {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                <div className="bg-gray-50 p-6 rounded-xl mb-8" ref={userFormRef}>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" />
                                        {editingItem ? 'Ажурирај корисник' : 'Додај корисник'}
                                    </h3>
                                    <form onSubmit={handleUserSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Име" value={userForm.firstName}
                                                   onChange={e => setUserForm({ ...userForm, firstName: e.target.value })}
                                                   required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input type="text" placeholder="Презиме" value={userForm.lastName}
                                                   onChange={e => setUserForm({ ...userForm, lastName: e.target.value })}
                                                   required
                                                   className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={userForm.email}
                                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                            required
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={userForm.role}
                                                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="СТУДЕНТ">Студент</option>
                                                <option value="НАСТАВНИК">Наставник</option>
                                                <option value="АСИСТЕНТ">Асистент</option>
                                            </select>
                                            {userForm.role === 'СТУДЕНТ' && (
                                                <input
                                                    type="text"
                                                    placeholder="Број на индекс"
                                                    value={userForm.indexNumber}
                                                    onChange={e => setUserForm({ ...userForm, indexNumber: e.target.value })}
                                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button type="submit" className="flex-1 bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600">
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingItem(null);
                                                        setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
                                                    }}
                                                    className="bg-gray-500 text-white rounded-lg p-3 hover:bg-gray-600"
                                                >Откажи</button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Search and Export */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3" />
                                    <input
                                        placeholder="Пребарај корисници..."
                                        value={searchTerms.users}
                                        onChange={e => {
                                            setSearchTerms({ ...searchTerms, users: e.target.value });
                                            handleSearch('users', e.target.value);
                                        }}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button onClick={() => exportToCSV(users, 'korisnici')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>CSV</span>
                                </button>
                                <button onClick={() => exportToJSON(users, 'korisnici')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center space-x-2">
                                    <Download size={16} /> <span>JSON</span>
                                </button>
                                {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                    <>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'СТУДЕНТ'), 'studenti')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Студенти CSV</button>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'НАСТАВНИК'), 'profesori')} className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800">Професори CSV</button>
                                        <button onClick={() => exportToCSV(users.filter(u => u.role === 'АСИСТЕНТ'), 'asistenti')} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Асистенти CSV</button>
                                    </>
                                )}
                            </div>
                            {/* List of users */}
                            <div className="grid gap-4">
                                {getFilteredUsers().map(u => (
                                    <div key={u.id} className="bg-white rounded shadow p-6 border-l-4 border-green-500">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold">{u.firstName} {u.lastName}</h3>
                                                <p className="text-green-600 font-medium">{u.email}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded text-white text-sm ${
                                                    u.role === 'СТУДЕНТ' ? 'bg-blue-500' :
                                                        u.role === 'НАСТАВНИК' ? 'bg-purple-500' :
                                                            'bg-orange-500'
                                                }`}>
                                                    {u.role}
                                                </span>
                                                {u.indexNumber && <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">{u.indexNumber}</span>}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4">
                                            Регистриран: {new Date(u.createdAt).toLocaleDateString('mk-MK')}
                                        </div>
                                        {['НАСТАВНИК', 'АСИСТЕНТ'].includes(user?.role) && (
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleUserEdit(u)} className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 space-x-1"><Edit size={16} /><span>Уреди</span></button>
                                                <button onClick={() => handleUserDelete(u.id)} className="flex items-center bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 space-x-1"><Trash2 size={16} /><span>Избриши</span></button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {getFilteredUsers().length === 0 && <div className="text-center text-gray-500 py-8">Нема корисници</div>}
                            </div>
                        </div>
                    )}

                    {/* DASHBOARD TAB */}
                    {!loading && activeTab === 'dashboard' && (
                        <div className="p-8">
                            <h2 className="text-2xl font-bold mb-8 flex items-center">
                                <BarChart3 className="mr-2" /> Dashboard & Analytics
                            </h2>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{subjects.length}</div>
                                    <div>Вкупно Предмети</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{assignments.length}</div>
                                    <div>Вкупно Задачи</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">{users.length}</div>
                                    <div>Вкупно Корисници</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded p-6">
                                    <div className="text-3xl font-bold">
                                        {userAssignments.length > 0
                                            ? (userAssignments.reduce((acc, val) => acc + (val.grade || 0), 0) / userAssignments.filter(ua => ua.grade !== null).length).toFixed(1)
                                            : '0.0'}
                                    </div>
                                    <div>Просек Оценка</div>
                                </div>
                            </div>
                            {/* More analytics... */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentManagementSystem;
