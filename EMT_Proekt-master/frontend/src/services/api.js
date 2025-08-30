// For Docker setup without nginx - point to the exposed backend port
const API_BASE = 'http://localhost:8081';

class ApiService {
    // Helper method за HTTP барања
    async fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // <--- ОВДЕ СМЕНИ! (204 не враќа body)
            if (response.status === 204) {
                return undefined; // no content for DELETE/PUT
            }

            // (ако има Content-Length = 0 или body е празен, врати undefined)
            const text = await response.text();
            if (!text) return [];
            return JSON.parse(text);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // AUTH API
    async login(email, password) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(userObj) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/register`, {
            method: 'POST',
            body: JSON.stringify(userObj),
        });
    }



    // Subjects API
    async getSubjects() {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects`);
    }

    async createSubject(subjectData) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects`, {
            method: 'POST',
            body: JSON.stringify(subjectData),
        });
    }

    async updateSubject(id, subjectData) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(subjectData),
        });
    }

    async deleteSubject(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/${id}`, {
            method: 'DELETE',
        });
    }

    async searchSubjects(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/subjects/search?term=${encodeURIComponent(term)}`);
    }

    // Assignments API
    async getAssignments() {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments`);
    }

    async createAssignment(assignmentData) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments`, {
            method: 'POST',
            body: JSON.stringify(assignmentData),
        });
    }

    async updateAssignment(id, assignmentData) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(assignmentData),
        });
    }

    async deleteAssignment(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments/${id}`, {
            method: 'DELETE',
        });
    }

    async searchAssignments(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/assignments/search?term=${encodeURIComponent(term)}`);
    }

    // Users API
    async getUsers() {
        return this.fetchWithErrorHandling(`${API_BASE}/users`);
    }

    async createUser(userData) {
        return this.fetchWithErrorHandling(`${API_BASE}/users`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id, userData) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/${id}`, {
            method: 'DELETE',
        });
    }

    async searchUsers(term) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/search?term=${encodeURIComponent(term)}`);
    }
    async getStudentsForSubject(subjectId) {
        return this.fetchWithErrorHandling(`${API_BASE}/users/subject/${subjectId}/students`);
    }

    // User Assignments API
    async getUserAssignments() {
        return this.fetchWithErrorHandling(`${API_BASE}/submissions`);
    }
}

export default new ApiService();