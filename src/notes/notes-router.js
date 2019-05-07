const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');
const path = require('path');


const notesRouter = express.Router();
const jsonParser = express.json();

function sanitizeNote(note) {
    const sanitizedNote = {
        id: note.id,
        name: xss(note.name),
        content: xss(note.content),

        modified: note.modified,
        folder_id: note.folder_id
    };

    //sanitize
    if (note.description) {
        sanitizedNote.description = xss(note.description);
    }
    return sanitizedNote;
}

notesRouter
    .route('/api/notes')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                return res.json(notes.map(note => sanitizeNote(note)));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        //create variable to hold req.app.get(db)
        const knexInstance = req.app.get('db');
        let { name, content, folder_id } = req.body;
        //parseInt for folderID
        let newNote = { name, content, folder_id: parseInt(folder_id) };

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {

                res
                    .status(201)
                    //posix again
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(sanitizeNote(note));
            })
            .catch(next);
    });

notesRouter
    .route('/api/notes/:noteId')

    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `note doesn't exist` }
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .patch(jsonParser, (req, res, next) => {
        //create variable for req.app.get('db')
        const knexInstance = req.app.get('db');
        const newNoteFields = req.body;
        const { noteId } = req.params;

        NotesService.updateNote(knexInstance,
            noteId,
            newNoteFields)
            .then(note => {
                if (note == null) {

                    return res.status(404).json({ error: { message: `Note with id ${noteId} not found` } });
                }
                //santize
                res.json(sanitizeNote(note));
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        //create variable for req.app.get('db')
        const knexInstance = req.app.get('db');
        const { noteId } = req.params;
        NotesService.deleteNote(knexInstance, noteId)
            .then((note) => {
                if (!note) {

                    return res.status(404).json({ error: { message: `Note with id ${noteId} not found` } });
                }

                res.status(204).end();
            })
            .catch(next);
    });

module.exports = notesRouter;