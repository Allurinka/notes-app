const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");

// GET все заметки
router.get("/", async (req, res) => {
    try {
        const notes = await notesController.getAllNotes();
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error("Ошибка GET /api/notes:", error);
        res.status(500).json({ 
            success: false, 
            error: "Ошибка загрузки заметок" 
        });
    }
});

// POST создать заметку
router.post("/", async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || title.trim() === "") {
            return res.status(400).json({ 
                success: false, 
                error: "Заголовок обязателен" 
            });
        }
        
        const newNote = await notesController.createNote(title, content);
        res.json({ success: true, data: newNote });
    } catch (error) {
        console.error("Ошибка POST /api/notes:", error);
        res.status(500).json({ 
            success: false, 
            error: "Ошибка создания заметки" 
        });
    }
});

// DELETE удалить заметку
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await notesController.deleteNote(id);
        
        if (!deleted) {
            return res.status(404).json({ 
                success: false, 
                error: "Заметка не найдена" 
            });
        }
        
        res.json({ success: true, message: "Заметка удалена" });
    } catch (error) {
        console.error("Ошибка DELETE /api/notes:", error);
        res.status(500).json({ 
            success: false, 
            error: "Ошибка удаления заметки" 
        });
    }
});

module.exports = router;
