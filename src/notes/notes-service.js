const NotesService = {


    getAllNotes(knex) {
        return knex.select('*').from('notes');
    },

    getBoomarkById(knex, id) {
        return knex.from('notes').select('*').where('id', id).first();
    },

    insertNote(knex, newNote) {
        return knex.insert(newNote).into('notes').returning('*').then(rows => rows[0]);
    },
    deleteNote(knex, id) {
        return knex('notes').where('id', id).delete();
    },
    updateNote(knex, id, newNotesFields) {
        return knex('notes').select('*').where('id', id).first().update(newNotesFields)
            .returning('*')
            .then(rows => rows[0]);
    }
};

module.exports = NotesService;