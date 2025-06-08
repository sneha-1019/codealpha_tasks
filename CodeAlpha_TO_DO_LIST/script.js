class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.initializeEventListeners();
        this.render();
    }

    initializeEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Add task events
        addBtn.addEventListener('click', () => this.handleAddTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTask();
        });

        // Filter events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    handleAddTask() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const taskText = taskInput.value.trim();

        if (!taskText) {
            taskInput.focus();
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskText, prioritySelect.value);
            this.editingTaskId = null;
            document.getElementById('addBtn').textContent = 'Add Task';
        } else {
            this.addTask(taskText, prioritySelect.value);
        }

        taskInput.value = '';
        prioritySelect.value = 'medium';
        taskInput.focus();
    }

    addTask(text, priority) {
        const task = {
            id: Date.now().toString(),
            text: text,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
    }

    updateTask(id, text, priority) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = text;
            this.tasks[taskIndex].priority = priority;
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            document.getElementById('taskInput').value = task.text;
            document.getElementById('prioritySelect').value = task.priority;
            document.getElementById('addBtn').textContent = 'Update Task';
            document.getElementById('taskInput').focus();
            this.editingTaskId = id;
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'high':
                return this.tasks.filter(task => task.priority === 'high');
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="todoApp.toggleTask('${task.id}')">
                    <div class="task-content">
                        <div class="task-text">${this.escapeHtml(task.text)}</div>
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                            <span>Created ${this.formatDate(task.createdAt)}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="todoApp.editTask('${task.id}')">Edit</button>
                        <button class="delete-btn" onclick="todoApp.deleteTask('${task.id}')">Delete</button>
                    </div>
                `;
                
                taskList.appendChild(li);
            });
        }

        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        const tasksData = JSON.stringify(this.tasks);
        // Store in memory instead of localStorage
        this.storedTasks = tasksData;
    }

    loadTasks() {
        try {
            // Load from memory instead of localStorage
            return this.storedTasks ? JSON.parse(this.storedTasks) : [];
        } catch (e) {
            return [];
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
