const express = require("express");
const cors = require("cors");
const path = require("path");
const notesRouter = require("./routes/notes");

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация путей
const ROOT_PATH = path.join(__dirname, "..", ".."); // notes-app/
const FRONTEND_PATH = path.join(ROOT_PATH, "frontend");

console.log("=== ЗАПУСК СЕРВЕРА ===");
console.log("Версия Node.js:", process.version);
console.log("Порт:", PORT);
console.log("Путь к фронтенду:", FRONTEND_PATH);
console.log("======================");

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы фронтенда
app.use(express.static(FRONTEND_PATH));

// API Routes
app.use("/api/notes", notesRouter);

// Главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// 404 обработчик
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: "Маршрут не найден" 
    });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Ошибка сервера:", err);
    res.status(500).json({ 
        success: false, 
        error: "Внутренняя ошибка сервера" 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`\n✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 API: http://localhost:${PORT}/api/notes`);
    console.log(`🌐 Фронтенд: http://localhost:${PORT}`);
    console.log(`📁 Файл заметок: ${path.join(ROOT_PATH, "notes.json")}`);
    console.log("=".repeat(50));
});
