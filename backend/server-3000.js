const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

console.log('=== ЗАПУСК СЕРВЕРА НА ПОРТУ 3000 ===');

// CORS - разрешаем всё
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const NOTES_FILE = path.join(__dirname, '..', 'notes.json');

// Логируем все запросы
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ========== API РОУТЫ ==========

// 1. Тестовый роут
app.get('/api/test', (req, res) => {
    console.log('✅ GET /api/test');
    res.json({
        success: true,
        message: '✅ Сервер работает на порту 3000!',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// 2. Получить все заметки
app.get('/api/notes', async (req, res) => {
    console.log('📝 GET /api/notes');
    try {
        const data = await fs.readFile(NOTES_FILE, 'utf8');
        const notes = JSON.parse(data);
        console.log(`✅ Отправляю ${notes.length} заметок`);
        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('📄 Создаю файл notes.json');
            await fs.writeFile(NOTES_FILE, JSON.stringify([]));
            res.json({
                success: true,
                data: [],
                message: 'Файл создан'
            });
        } else {
            console.error('❌ Ошибка:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

// 3. Создать заметку
app.post('/api/notes', async (req, res) => {
    console.log('➕ POST /api/notes:', req.body);
    try {
        const { title, content } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Заголовок обязателен'
            });
        }
        
        const notes = JSON.parse(await fs.readFile(NOTES_FILE, 'utf8'));
        const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: (content || '').trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
        
        console.log(`✅ Создана заметка: "${newNote.title}"`);
        res.json({
            success: true,
            data: newNote
        });
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 4. Удалить заметку
app.delete('/api/notes/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`🗑️ DELETE /api/notes/${id}`);
    
    try {
        const notes = JSON.parse(await fs.readFile(NOTES_FILE, 'utf8'));
        const newNotes = notes.filter(note => note.id !== id);
        
        if (notes.length === newNotes.length) {
            return res.status(404).json({
                success: false,
                error: 'Заметка не найдена'
            });
        }
        
        await fs.writeFile(NOTES_FILE, JSON.stringify(newNotes, null, 2));
        
        console.log(`✅ Удалена заметка ID: ${id}`);
        res.json({
            success: true,
            message: 'Заметка удалена'
        });
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Статический фронтенд
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Запуск
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 СЕРВЕР ЗАПУЩЕН НА ПОРТУ 3000!');
    console.log('🌐 http://localhost:' + PORT);
    console.log('📡 API тест: http://localhost:' + PORT + '/api/test');
    console.log('📝 API заметки: http://localhost:' + PORT + '/api/notes');
    console.log('='.repeat(50) + '\n');
});