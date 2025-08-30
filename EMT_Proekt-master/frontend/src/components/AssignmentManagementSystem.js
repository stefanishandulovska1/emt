import React, { useState, useEffect,useRef } from 'react';
import { Search, Plus, Edit, Trash2, Download, Upload, Users, BookOpen, Award, BarChart3 } from 'lucide-react';
import apiService from '../services/api';

    const AssignmentManagementSystem = () => {
        const [activeTab, setActiveTab] = useState('subjects');
        const [subjects, setSubjects] = useState([]);
        const [assignments, setAssignments] = useState([]);
        const [users, setUsers] = useState([]);

        const professors = users.filter(u => u.role === 'НАСТАВНИК');
        const assistants = users.filter(u => u.role === 'АСИСТЕНТ');

        const [userAssignments, setUserAssignments] = useState([]);
        const [loading, setLoading] = useState(false);

        // Form states
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
            dueDate:'',
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


        // Fetch data functions using API service
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const data = await apiService.getSubjects();
                setSubjects(data);
            } catch (error) {
                showNotification('error', 'Грешка при вчитување предмети');
                console.error('Грешка при вчитување предмети:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const data = await apiService.getAssignments();
                setAssignments(data);
            } catch (error) {
                showNotification('error', 'Грешка при вчитување assignments');
                console.error('Грешка при вчитување assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await apiService.getUsers();
                setUsers(data);
            } catch (error) {
                showNotification('error', 'Грешка при вчитување корисници');
                console.error('Грешка при вчитување корисници:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserAssignments = async () => {
            try {
                const data = await apiService.getUserAssignments();
                setUserAssignments(data);
            } catch (error) {
                showNotification('error', 'Грешка при вчитување оценки');
                console.error('Грешка при вчитување оценки:', error);
            }
        };

        useEffect(() => {
            fetchSubjects();
            fetchAssignments();
            fetchUsers();
            fetchUserAssignments();
        }, []);

        // Subject functions
        const handleSubjectSubmit = async (e) => {
            e.preventDefault();
            try {
                setLoading(true);
                if (editingItem) {
                    await apiService.updateSubject(editingItem, subjectForm);
                    showNotification('success', 'Предметот е успешно ажуриран!');
                } else {
                    await apiService.createSubject(subjectForm);
                    showNotification('success', 'Предметот е успешно додаден!');
                }

                setSubjectForm({ code: '', name: '', semester: '', year: 1, professor: '', assistant: '' });
                setEditingItem(null);
                fetchSubjects();
            } catch (error) {
                showNotification('error', 'Грешка при зачувување на предметот');
            } finally {
                setLoading(false);
            }
        };

        const handleSubjectEdit = (subject) => {
            setSubjectForm({
                code: subject.code || '',
                name: subject.name || '',
                semester: subject.semester || '',
                year: subject.year || 1,
                professor: subject.professor || '',
                assistant: subject.assistant || ''   // Обезбеди го ова поле тука секогаш!
            });
            setEditingItem(subject.id);
            if (subjectFormRef.current) subjectFormRef.current.scrollIntoView({ behavior: 'smooth' });
        };


        const handleSubjectDelete = async (id) => {
            if (window.confirm('Дали сте сигурни дека сакате да го избришете овој предмет?')) {
                try {
                    setLoading(true);
                    await apiService.deleteSubject(id);
                    showNotification('success', 'Предметот е успешно избришан!');
                    fetchSubjects();
                } catch (error) {
                    showNotification('error', 'Грешка при бришење на предметот');
                } finally {
                    setLoading(false);
                }
            }
        };

        // Assignment functions
        const handleAssignmentSubmit = async (e) => {
            e.preventDefault();
            try {
                setLoading(true);

                const assignmentData = {
                    ...assignmentForm,
                    points: assignmentForm.points === "" ? 1 : Number(assignmentForm.points), // Ако е празно, default: 1
                    subjectId: Number(assignmentForm.subjectId),
                    dueDate: assignmentForm.dueDate
                        ? (assignmentForm.dueDate.length === 16
                            ? assignmentForm.dueDate + ':00'
                            : assignmentForm.dueDate)
                        : null,
                };
                if (editingItem) {
                    await apiService.updateAssignment(editingItem, assignmentData);
                    showNotification('success', 'Assignment е успешно ажуриран!');
                } else {
                    await apiService.createAssignment(assignmentData);
                    showNotification('success', 'Assignment е успешно додаден!');
                }
                setAssignmentForm({ title: '', description: '', points: 1, requirements: '', subjectId: '', dueDate: '' });
                setEditingItem(null);
                fetchAssignments();
            } catch (error) {
                showNotification('error', 'Грешка при зачувување на assignment');
            } finally {
                setLoading(false);
            }
        };


        const handleAssignmentEdit = (assignment) => {
            setAssignmentForm(assignment);
            setEditingItem(assignment.id);
            if (assignmentFormRef.current) assignmentFormRef.current.scrollIntoView({ behavior: 'smooth' });
        };

        const handleAssignmentDelete = async (id) => {
            if (window.confirm('Дали сте сигурни дека сакате да го избришете овој assignment?')) {
                try {
                    setLoading(true);
                    await apiService.deleteAssignment(id);
                    showNotification('success', 'Assignment е успешно избришан!');
                    fetchAssignments();
                } catch (error) {
                    showNotification('error', 'Грешка при бришење на assignment');
                } finally {
                    setLoading(false);
                }
            }
        };

        // User functions
        const handleUserSubmit = async (e) => {
            e.preventDefault();
            try {
                setLoading(true);
                if (editingItem) {
                    await apiService.updateUser(editingItem, userForm);
                    showNotification('success', 'Корисникот е успешно ажуриран!');
                } else {
                    await apiService.createUser(userForm);
                    showNotification('success', 'Корисникот е успешно додаден!');
                }

                setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
                setEditingItem(null);
                fetchUsers();
            } catch (error) {
                showNotification('error', 'Грешка при зачувување на корисникот');
            } finally {
                setLoading(false);
            }
        };

        const handleUserEdit = (user) => {
            setUserForm(user);
            setEditingItem(user.id);
            if (userFormRef.current) userFormRef.current.scrollIntoView({ behavior: 'smooth' });
        };

        const handleUserDelete = async (id) => {
            if (window.confirm('Дали сте сигурни дека сакате да го избришете овој корисник?')) {
                try {
                    setLoading(true);
                    await apiService.deleteUser(id);
                    showNotification('success', 'Корисникот е успешно избришан!');
                    fetchUsers();
                } catch (error) {
                    showNotification('error', 'Грешка при бришење на корисникот');
                } finally {
                    setLoading(false);
                }
            }
        };

        // Notification function
        const showNotification = (type, message) => {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
                type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        };

        // Search functions using API service
        const handleSearch = async (type, term) => {
            if (!term.trim()) {
                // If search term is empty, fetch all data
                switch (type) {
                    case 'subjects':
                        fetchSubjects();
                        break;
                    case 'assignments':
                        fetchAssignments();
                        break;
                    case 'users':
                        fetchUsers();
                        break;
                }
                return;
            }

            try {
                let data;
                switch (type) {
                    case 'subjects':
                        data = await apiService.searchSubjects(term);
                        setSubjects(data);
                        break;
                    case 'assignments':
                        data = await apiService.searchAssignments(term);
                        setAssignments(data);
                        break;
                    case 'users':
                        data = await apiService.searchUsers(term);
                        setUsers(data);
                        break;
                }
            } catch (error) {
                console.error(`Грешка при пребарување ${type}:`, error);
            }
        };

        // Export functions
        const exportToCSV = (data, filename) => {
            if (!data.length) return;

            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => Object.values(obj).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(','));
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
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        };

        // Filter functions (client-side filtering for better performance)
        const getFilteredSubjects = () => {
            if (!searchTerms.subjects) return subjects;
            return subjects.filter(subject =>
                (subject.name && subject.name.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
                (subject.code && subject.code.toLowerCase().includes(searchTerms.subjects.toLowerCase())) ||
                (subject.professor && subject.professor.toLowerCase().includes(searchTerms.subjects.toLowerCase()))
            );
        };

        const getFilteredAssignments = () => {
            if (!searchTerms.assignments) return assignments;
            return assignments.filter(assignment =>
                (assignment.title && assignment.title.toLowerCase().includes(searchTerms.assignments.toLowerCase())) ||
                (assignment.description && assignment.description.toLowerCase().includes(searchTerms.assignments.toLowerCase()))
            );
        };

        const getFilteredUsers = () => {
            if (!searchTerms.users) return users;
            return users.filter(user =>
                (user.firstName && user.firstName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
                (user.lastName && user.lastName.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerms.users.toLowerCase())) ||
                (user.indexNumber && user.indexNumber.toLowerCase().includes(searchTerms.users.toLowerCase()))
            );
        };

        // Loading component
        const LoadingSpinner = () => (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Се вчитува...</span>
            </div>
        );

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
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
                                { key: 'assignments', label: 'Assignments', icon: Award },
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

                        {/* Loading state */}
                        {loading && <LoadingSpinner />}

                        {/* Subjects Tab */}
                        {!loading && activeTab === 'subjects' && (
                            <div className="p-8">
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
                                        <div>Вкупно Assignments</div>
                                    </div>
                                </div>

                                {/* Add Subject Form */}
                                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" size={20} />
                                        {editingItem ? 'Ажурирај Предмет' : 'Додај Нов Предмет'}
                                    </h3>
                                    <form onSubmit={handleSubjectSubmit} ref={subjectFormRef}
                                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Код на предмет (пр. CS101)"
                                            value={subjectForm.code}
                                            onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Име на предмет"
                                            value={subjectForm.name}
                                            onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Семестар (пр. 2024/1)"
                                            value={subjectForm.semester}
                                            onChange={(e) => setSubjectForm({...subjectForm, semester: e.target.value})}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <select
                                            value={subjectForm.year}
                                            onChange={(e) => setSubjectForm({
                                                ...subjectForm,
                                                year: parseInt(e.target.value)
                                            })}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value={1}>Прва година</option>
                                            <option value={2}>Втора година</option>
                                            <option value={3}>Трета година</option>
                                            <option value={4}>Четврта година</option>
                                        </select>
                                        <select
                                            value={subjectForm.professor}
                                            onChange={e => setSubjectForm({...subjectForm, professor: e.target.value})}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Избери професор</option>
                                            {professors.map(prof => (
                                                <option key={prof.id} value={prof.firstName + ' ' + prof.lastName}>
                                                    {prof.firstName} {prof.lastName} ({prof.email})
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={subjectForm.assistant}
                                            onChange={e => setSubjectForm({...subjectForm, assistant: e.target.value})}
                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Избери асистент</option>
                                            {assistants.map(ast => (
                                                <option key={ast.id} value={ast.firstName + ' ' + ast.lastName}>
                                                    {ast.firstName} {ast.lastName} ({ast.email})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingItem(null);
                                                        setSubjectForm({
                                                            code: '',
                                                            name: '',
                                                            semester: '',
                                                            year: 1,
                                                            professor: '',
                                                            assistant: ''
                                                        });
                                                    }}
                                                    className="px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                >
                                                    Откажи
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Search and Export */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                                        <input
                                            type="text"
                                            placeholder="Пребарај предмети..."
                                            value={searchTerms.subjects}
                                            onChange={(e) => {
                                                setSearchTerms({ ...searchTerms, subjects: e.target.value });
                                                handleSearch('subjects', e.target.value);
                                            }}
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={() => exportToCSV(subjects, 'predmeti')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16} />
                                        <span>CSV</span>
                                    </button>
                                    <button
                                        onClick={() => exportToJSON(subjects, 'predmeti')}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16} />
                                        <span>JSON</span>
                                    </button>
                                </div>

                                {/* Subjects List */}
                                <div className="grid gap-4">
                                    {getFilteredSubjects().map((subject) => (
                                        <div key={subject.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-800">{subject.name}</h3>
                                                    <p className="text-blue-600 font-medium">{subject.code}</p>
                                                </div>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {subject.semester}
                      </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Година: </span>
                                                    {subject.year}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Професор: </span>
                                                    {subject.professor || 'Не е внесено'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Асистент: </span>
                                                    {subject.assistant || 'Не е внесено'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Assignments: </span>
                                                    {subject.assignmentCount || 0}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 mt-4">
                                                <button
                                                    onClick={() => handleSubjectEdit(subject)}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    <Edit size={16}/>
                                                    <span>Ажурирај</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSubjectDelete(subject.id)}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16}/>
                                                    <span>Избриши</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const students = await apiService.getStudentsForSubject(subject.id);
                                                        exportToCSV(students, `studenti-za-predmet-${subject.code}`);
                                                    }}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    <Download size={16}/>
                                                    <span>Студенти CSV</span>
                                                </button>

                                            </div>
                                        </div>
                                    ))}
                                    {getFilteredSubjects().length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            Нема пронајдени предмети
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Assignments Tab */}
                        {!loading && activeTab === 'assignments' && (
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                        <div className="text-3xl font-bold">{assignments.length}</div>
                                        <div>Вкупно Assignments</div>
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

                                {/* Add Assignment Form */}
                                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" size={20} />
                                        {editingItem ? 'Ажурирај Assignment' : 'Додај Нов Assignment'}
                                    </h3>
                                    <form onSubmit={handleAssignmentSubmit} ref={assignmentFormRef} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Наслов на assignment"
                                                value={assignmentForm.title}
                                                onChange={(e) => setAssignmentForm({
                                                    ...assignmentForm,
                                                    title: e.target.value
                                                })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Број на поени (1-100)"
                                                value={assignmentForm.points}
                                                min="1"
                                                max="100"
                                                required
                                                onChange={e => {
                                                    // Не дозволувај празно
                                                    if (e.target.value === "") {
                                                        setAssignmentForm({ ...assignmentForm, points: 1 });
                                                    } else {
                                                        setAssignmentForm({ ...assignmentForm, points: e.target.value });
                                                    }
                                                }}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Краток опис на assignment"
                                            value={assignmentForm.description}
                                            onChange={(e) => setAssignmentForm({
                                                ...assignmentForm,
                                                description: e.target.value
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                        />
                                        <textarea
                                            placeholder="Детални барања за assignment"
                                            value={assignmentForm.requirements}
                                            onChange={(e) => setAssignmentForm({
                                                ...assignmentForm,
                                                requirements: e.target.value
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="4"
                                        />
                                        <input
                                            type="datetime-local"
                                            placeholder="Датум на предавање"
                                            value={assignmentForm.dueDate}
                                            onChange={e => setAssignmentForm({
                                                ...assignmentForm,
                                                dueDate: e.target.value
                                            })}
                                        />

                                        <select
                                            value={assignmentForm.subjectId}
                                            onChange={(e) => setAssignmentForm({
                                                ...assignmentForm,
                                                subjectId: e.target.value
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Избери предмет...</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.code} - {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors"
                                            >
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingItem(null);
                                                        setAssignmentForm({
                                                            title: '',
                                                            description: '',
                                                            points: '',
                                                            requirements: '',
                                                            subjectId: ''
                                                        });
                                                    }}
                                                    className="px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                >
                                                    Откажи
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Search and Export */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Пребарај assignments..."
                                            value={searchTerms.assignments}
                                            onChange={(e) => {
                                                setSearchTerms({ ...searchTerms, assignments: e.target.value });
                                                handleSearch('assignments', e.target.value);
                                            }}
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={() => exportToCSV(assignments, 'assignments')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16} />
                                        <span>CSV</span>
                                    </button>
                                    <button
                                        onClick={() => exportToJSON(assignments, 'assignments')}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16} />
                                        <span>JSON</span>
                                    </button>
                                </div>

                                {/* Assignments List */}
                                <div className="grid gap-4">
                                    {getFilteredAssignments().map((assignment) => (
                                        <div key={assignment.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
                                                    <p className="text-purple-600 font-medium">{assignment.subjectCode} - {assignment.subjectName}</p>
                                                </div>
                                                <div className="flex space-x-2">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {assignment.points} поени
                        </span>
                                                    {assignment.averageGrade && (
                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            Просек: {assignment.averageGrade.toFixed(1)}
                          </span>
                                                    )}
                                                </div>
                                            </div>
                                            {assignment.description && (
                                                <p className="text-gray-600 mb-3">{assignment.description}</p>
                                            )}
                                            {assignment.requirements && (
                                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                                    <h4 className="font-medium text-gray-800 mb-2">Барања:</h4>
                                                    <p className="text-gray-600 text-sm">{assignment.requirements}</p>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    Креирано: {new Date(assignment.createdAt).toLocaleDateString('mk-MK')}
                                                    {assignment.submissionCount > 0 && (
                                                        <span className="ml-4">
                            Поднесени: {assignment.submissionCount}
                          </span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleAssignmentEdit(assignment)}
                                                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                        <span>Ажурирај</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAssignmentDelete(assignment.id)}
                                                        className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Избриши</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {getFilteredAssignments().length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            Нема пронајдени assignments
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {!loading && activeTab === 'users' && (
                            <div className="p-8">
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

                                {/* Add User Form */}
                                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <Plus className="mr-2" size={20} />
                                        {editingItem ? 'Ажурирај Корисник' : 'Додај Нов Корисник'}
                                    </h3>
                                    <form onSubmit={handleUserSubmit} ref={userFormRef} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Име"
                                                value={userForm.firstName}
                                                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Презиме"
                                                value={userForm.lastName}
                                                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email адреса"
                                            value={userForm.email}
                                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={userForm.role}
                                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    onChange={(e) => setUserForm({ ...userForm, indexNumber: e.target.value })}
                                                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                {editingItem ? 'Ажурирај' : 'Додај'}
                                            </button>
                                            {editingItem && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingItem(null);
                                                        setUserForm({ firstName: '', lastName: '', email: '', role: 'СТУДЕНТ', indexNumber: '' });
                                                    }}
                                                    className="px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                >
                                                    Откажи
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Search and Export */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                                        <input
                                            type="text"
                                            placeholder="Пребарај корисници..."
                                            value={searchTerms.users}
                                            onChange={(e) => {
                                                setSearchTerms({...searchTerms, users: e.target.value});
                                                handleSearch('users', e.target.value);
                                            }}
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={() => exportToCSV(users, 'korisnici')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16}/>
                                        <span>CSV</span>
                                    </button>
                                    <button
                                        onClick={() => exportToJSON(users, 'korisnici')}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16}/>
                                        <span>JSON</span>
                                    </button>
                                    <button
                                        onClick={() => exportToCSV(users.filter(u => u.role === 'СТУДЕНТ'), 'korisnici-studenti')}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16}/>
                                        <span>Студенти CSV</span>
                                    </button>
                                    <button
                                        onClick={() => exportToCSV(users.filter(u => u.role === 'НАСТАВНИК'), 'korisnici-nastavnici')}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16}/>
                                        <span>Професори CSV</span>
                                    </button>
                                    <button
                                        onClick={() => exportToCSV(users.filter(u => u.role === 'АСИСТЕНТ'), 'korisnici-asistenti')}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                    >
                                        <Download size={16}/>
                                        <span>Асистенти CSV</span>
                                    </button>

                                </div>

                                {/* Users List */}
                                <div className="grid gap-4">
                                    {getFilteredUsers().map((user) => (
                                        <div key={user.id}
                                             className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-800">
                                                        {user.firstName} {user.lastName}
                                                    </h3>
                                                    <p className="text-green-600 font-medium">{user.email}</p>
                                                </div>
                                                <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm text-white ${
                            user.role === 'СТУДЕНТ' ? 'bg-blue-500' :
                                user.role === 'НАСТАВНИК' ? 'bg-purple-500' : 'bg-orange-500'
                        }`}>
                          {user.role}
                        </span>
                                                    {user.indexNumber && (
                                                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {user.indexNumber}
                          </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-4">
                                                Регистриран: {new Date(user.createdAt).toLocaleDateString('mk-MK')}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleUserEdit(user)}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                    <span>Ажурирај</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUserDelete(user.id)}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    <span>Избриши</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {getFilteredUsers().length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            Нема пронајдени корисници
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dashboard Tab */}
                        {!loading && activeTab === 'dashboard' && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold mb-8 flex items-center">
                                    <BarChart3 className="mr-2" />
                                    Dashboard & Analytics
                                </h2>

                                {/* Main Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                        <div className="text-3xl font-bold">{subjects.length}</div>
                                        <div>Вкупно Предмети</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                        <div className="text-3xl font-bold">{assignments.length}</div>
                                        <div>Вкупно Assignments</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                                        <div className="text-3xl font-bold">{users.length}</div>
                                        <div>Вкупно Корисници</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                                        <div className="text-3xl font-bold">
                                            {userAssignments.length > 0 ?
                                                (userAssignments
                                                        .filter(ua => ua.grade !== null)
                                                        .reduce((sum, ua) => sum + ua.grade, 0) /
                                                    userAssignments.filter(ua => ua.grade !== null).length
                                                ).toFixed(1) : '0.0'}
                                        </div>
                                        <div>Просечна Оценка</div>
                                    </div>
                                </div>

                                {/* Detailed Statistics */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Subjects by Year */}
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h3 className="text-lg font-semibold mb-4">Предмети по Години</h3>
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map(year => {
                                                const count = subjects.filter(s => s.year === year).length;
                                                const percentage = subjects.length > 0 ? (count / subjects.length * 100) : 0;
                                                return (
                                                    <div key={year} className="flex items-center">
                                                        <span className="w-20 text-sm font-medium">{year}. година</span>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                                                            <div
                                                                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-12 text-sm text-gray-600">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* User Roles Distribution */}
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h3 className="text-lg font-semibold mb-4">Распределба на Корисници</h3>
                                        <div className="space-y-3">
                                            {['СТУДЕНТ', 'НАСТАВНИК', 'АСИСТЕНТ'].map(role => {
                                                const count = users.filter(u => u.role === role).length;
                                                const percentage = users.length > 0 ? (count / users.length * 100) : 0;
                                                const color = role === 'СТУДЕНТ' ? 'bg-blue-500' :
                                                    role === 'НАСТАВНИК' ? 'bg-purple-500' : 'bg-orange-500';
                                                return (
                                                    <div key={role} className="flex items-center">
                                                        <span className="w-20 text-sm font-medium">{role}</span>
                                                        <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                                                            <div
                                                                className={`${color} h-4 rounded-full transition-all duration-300`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-12 text-sm text-gray-600">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Latest Subjects */}
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h3 className="text-lg font-semibold mb-4">Најнови Предмети</h3>
                                        <div className="space-y-3">
                                            {subjects
                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                .slice(0, 5)
                                                .map((subject) => (
                                                    <div key={subject.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <div>
                                                            <span className="font-medium text-sm">{subject.name}</span>
                                                            <span className="text-blue-600 text-xs ml-2">({subject.code})</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                            {new Date(subject.createdAt).toLocaleDateString('mk-MK')}
                          </span>
                                                    </div>
                                                ))}
                                            {subjects.length === 0 && (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    Нема предмети
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Latest Assignments */}
                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h3 className="text-lg font-semibold mb-4">Најнови Assignments</h3>
                                        <div className="space-y-3">
                                            {assignments
                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                .slice(0, 5)
                                                .map((assignment) => (
                                                    <div key={assignment.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <div>
                                                            <span className="font-medium text-sm">{assignment.title}</span>
                                                            <span className="text-purple-600 text-xs ml-2">
                              ({assignment.points} поени)
                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                            {new Date(assignment.createdAt).toLocaleDateString('mk-MK')}
                          </span>
                                                    </div>
                                                ))}
                                            {assignments.length === 0 && (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    Нема assignments
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Export All Data */}
                                <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4">Export на Податоци</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => exportToCSV(subjects, 'sevi-predmeti')}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Download size={16} />
                                            <span>Предмети CSV</span>
                                        </button>
                                        <button
                                            onClick={() => exportToCSV(assignments, 'sevi-assignments')}
                                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Download size={16} />
                                            <span>Assignments CSV</span>
                                        </button>
                                        <button
                                            onClick={() => exportToCSV(users, 'sevi-korisnici')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Download size={16} />
                                            <span>Корисници CSV</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const allData = {
                                                    subjects,
                                                    assignments,
                                                    users,
                                                    userAssignments,
                                                    exportDate: new Date().toISOString()
                                                };
                                                exportToJSON(allData, 'kompleten-export');
                                            }}
                                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                                        >
                                            <Download size={16} />
                                            <span>Комплетен Export JSON</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    export default AssignmentManagementSystem;