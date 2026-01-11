const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3002;

// ПРАВИЛЬНЫЕ ПУТИ для структуры notes-app/backend/server.js
const ROOT_PATH = path.join(__dirname, '..');          // notes-app/
const FRONTEND_PATH = path.join(ROOT_PATH, 'frontend'); // notes-app/frontend/
const NOTES_FILE = path.join(ROOT_PATH, 'notes.json');  // notes-app/notes.json

console.log('=== ПУТИ СЕРВЕРА ===');
console.log('Текущая папка (__dirname):', __dirname);
console.log('Корневая папка проекта (ROOT_PATH):', ROOT_PATH);
console.log('Путь к фронтенду (FRONTEND_PATH):', FRONTEND_PATH);
console.log('Существует ли frontend?', fs.existsSync(FRONTEND_PATH) ? '✅ Да' : '❌ Нет');
console.log('Путь к notes.json (NOTES_FILE):', NOTES_FILE);
console.log('========================');

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы фронтенда
app.use(express.static(FRONTEND_PATH));

// Функции для работы с заметками
async function readNotes() {
    try {
        const data = await fs.readFile(NOTES_FILE, 'utf8');
        const notes = JSON.parse(data);
        console.log('📖 Прочитано заметок:', notes.length);
        return notes;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📄 Создаю новый файл notes.json');
            await fs.writeFile(NOTES_FILE, JSON.stringify([]));
            return [];
        }
        console.error('❌ Ошибка чтения:', error.message);
        return [];
    }
}

async function writeNotes(notes) {
    try {
        await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
        console.log('💾 Сохранено заметок:', notes.length);
    } catch (error) {
        console.error('❌ Ошибка записи:', error.message);
    }
}

// ============ API МАРШРУТЫ ============

// 1. Получить все заметки
app.get('/api/notes', async (req, res) => {
    console.log('📥 GET /api/notes');
    try {
        const notes = await readNotes();
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка загрузки заметок' 
        });
    }
});

// 2. Создать новую заметку
app.post('/api/notes', async (req, res) => {
    console.log('📝 POST /api/notes', req.body);
    try {
        const { title, content } = req.body;
        
        // Валидация
        if (!title || title.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'Заголовок обязателен' 
            });
        }
        
        const notes = await readNotes();
        const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: (content || '').trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('➕ Создаю заметку:', newNote.title);
        notes.unshift(newNote);
        await writeNotes(notes);
        
        res.json({ success: true, data: newNote });
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка создания заметки' 
        });
    }
});

// 3. Удалить заметку
app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    console.log('🗑️ DELETE /api/notes/', noteId);
    
    try {
        const notes = await readNotes();
        const initialLength = notes.length;
        const filteredNotes = notes.filter(note => note.id !== noteId);
        
        if (filteredNotes.length === initialLength) {
            return res.status(404).json({ 
                success: false, 
                error: 'Заметка не найдена' 
            });
        }
        
        await writeNotes(filteredNotes);
        res.json({ 
            success: true, 
            message: 'Заметка удалена',
            deletedId: noteId 
        });
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка удаления заметки' 
        });
    }
});

// 4. Тестовый маршрут
app.get('/api/test', (req, res) => {
    console.log('🧪 GET /api/test');
    res.json({ 
        success: true, 
        message: 'API работает!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ============ СТАТИЧЕСКИЕ ФАЙЛЫ ============

// Главная страница
app.get('/', (req, res) => {
    console.log('🏠 Запрос главной страницы');
    const indexPath = path.join(FRONTEND_PATH, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        console.error('❌ index.html не найден по пути:', indexPath);
        return res.status(404).send('Файл index.html не найден');
    }
    
    res.sendFile(indexPath);
});

// Обработка 404
app.use((req, res) => {
    console.log('❌ 404:', req.method, req.url);
    res.status(404).json({ 
        success: false, 
        error: 'Маршрут не найден' 
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('🔥 Ошибка сервера:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Внутренняя ошибка сервера' 
    });
});

// ============ ЗАПУСК СЕРВЕРА ============

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 СЕРВЕР ЗАПУЩЕН');
    console.log('🌐 Локальный URL: http://localhost:' + PORT);
    console.log('🌐 IP URL: http://127.0.0.1:' + PORT);
    console.log('📁 Файл данных: ' + NOTES_FILE);
    console.log('📁 Фронтенд: ' + FRONTEND_PATH);
    console.log('='.repeat(50) + '\n');
    
    // Тестовые ссылки
    console.log('🔗 Проверьте:');
    console.log('1. Главная: http://localhost:' + PORT + '/');
    console.log('2. API тест: http://localhost:' + PORT + '/api/test');
    console.log('3. API заметки: http://localhost:' + PORT + '/api/notes');
});