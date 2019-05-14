const NotesService = {


    getAllNotes(knex) {
        return knex.select('*').from('notes');
    },

    getNoteById(knex, id) {
        //undefined id
        console.log(` here is id on get note by id `, id.notes_id);
        return knex.from('notes').select('*').where('id', id.notes_id).first();
    },

    insertNote(knex, newNote) {
        return knex.insert(newNote).into('notes').returning('*').then(rows => rows[0]);
    },
    deleteNote(knex, id) {
        console.log(`deleteNote's id is `, id);
        return knex('notes').where('id', id).delete();
    },
    updateNote(knex, id, newNotesFields) {
        return knex('notes').select('*').where('id', id).first().update(newNotesFields)
            .returning('*')
            .then(rows => rows[0]);
    },
    getNotesFromFolder(knex, folder_id) {
        console.log(`service folder id`, folder_id);
        return knex.from('notes').select('*').where('folder_id', folder_id)
    }
};

module.exports = NotesService;