class NotesApp {
    constructor() {
        this.notes = [];
        this.API_URL = 'http://localhost:3000/api/notes';
        this.init();
    }
    
    async init() {
        await this.loadNotes();
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        const addBtn = document.getElementById('addBtn');
        const titleInput = document.getElementById('titleInput');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addNote());
        }
        
        if (titleInput) {
            titleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addNote();
            });
        }
    }
    
    async loadNotes() {
        try {
            console.log('Загружаю заметки с сервера...');
            const response = await fetch(this.API_URL);
            const result = await response.json();
            
            if (result.success) {
                this.notes = result.data;
                console.log('Загружено заметок:', this.notes.length);
                this.render();
            } else {
                console.error('Ошибка загрузки заметок:', result.error);
                this.showError('Не удалось загрузить заметки');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            this.showError('Проверьте подключение к серверу');
        }
    }
    
    async addNote() {
        const titleInput = document.getElementById('titleInput');
        const contentInput = document.getElementById('contentInput');
        
        if (!titleInput || !contentInput) {
            console.error('Поля ввода не найдены!');
            return;
        }
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title) {
            this.showError('Введите заголовок заметки');
            titleInput.focus();
            return;
        }
        
        try {
            console.log('Отправляю заметку на сервер...');
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content })
            });
            
            const result = await response.json();
            console.log('Ответ сервера:', result);
            
            if (result.success) {
                // Добавляем новую заметку в начало массива
                this.notes.unshift(result.data);
                this.render();
                
                // Очищаем поля
                titleInput.value = '';
                contentInput.value = '';
                titleInput.focus();
                
                this.showSuccess('Заметка создана!');
            } else {
                this.showError(result.error || 'Ошибка при создании заметки');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            this.showError('Не удалось подключиться к серверу');
        }
    }
    
    async deleteNote(id) {
        if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Удаляем заметку из массива
                this.notes = this.notes.filter(note => note.id !== id);
                this.render();
                this.showSuccess('Заметка удалена');
            } else {
                this.showError(result.error || 'Ошибка при удалении заметки');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            this.showError('Не удалось подключиться к серверу');
        }
    }
    
    render() {
        const notesList = document.getElementById('notesList');
        
        if (!notesList) {
            console.error('Контейнер notesList не найден!');
            return;
        }
        
        if (this.notes.length === 0) {
            notesList.innerHTML = '<div class="empty">Пока нет заметок. Создайте первую!</div>';
            return;
        }
        
        notesList.innerHTML = this.notes.map((note, index) => `
            <div class="note" data-note-id="${note.id}" style="animation-delay: ${index * 0.1}s">
                <button class="delete-btn" onclick="app.deleteNote('${note.id}')">Удалить</button>
                <div class="note-title">${this.escapeHtml(note.title)}</div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
                <div class="note-date">Создано: ${this.formatDate(note.createdAt)}</div>
                ${note.updatedAt !== note.createdAt ? 
                    `<div class="note-date">Обновлено: ${this.formatDate(note.updatedAt)}</div>` : ''}
            </div>
        `).join('');
        
        console.log('Отображено заметок:', this.notes.length);
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'success') {
        // Проверяем, есть ли уже уведомление
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.5s ease reverse forwards';
            setTimeout(() => notification.remove(), 500);
        });
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.5s ease reverse forwards';
                setTimeout(() => notification.remove(), 500);
            }
        }, 4000);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Неизвестно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Создаем приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NotesApp();
    console.log('Приложение NotesApp инициализировано');
});