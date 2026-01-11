// Модель заметки (можно расширить)
class Note {
    constructor(id, title, content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = Note;
