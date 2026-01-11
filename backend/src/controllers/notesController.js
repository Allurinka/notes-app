const fs = require('fs').promises;
const path = require('path');

class NotesController {
    constructor() {
        this.notesFilePath = path.join(__dirname, '..', '..', '..', 'notes.json');
    }
    
    async getAllNotes() {
        try {
            const data = await fs.readFile(this.notesFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Если файла нет, создаем пустой
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.notesFilePath, JSON.stringify([]));
                return [];
            }
            throw error;
        }
    }
    
    async createNote(title, content) {
        const notes = await this.getAllNotes();
        const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: (content || '').trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        await this.saveNotes(notes);
        return newNote;
    }
    
    async deleteNote(id) {
        const notes = await this.getAllNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        
        if (filteredNotes.length === notes.length) {
            return false; // Не найдено
        }
        
        await this.saveNotes(filteredNotes);
        return true;
    }
    
    async saveNotes(notes) {
        await fs.writeFile(this.notesFilePath, JSON.stringify(notes, null, 2));
    }
}

module.exports = new NotesController();
