const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folder_id: note.folder_id,
    content: note.content,
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                console.log(notes)
                res.json(notes.map(serializeNote));
            })
            .catch((error) => console.log(error));
    })
    .post(jsonParser, (req, res, next) => {
        const { name, folder_id, content } = req.body;
        if (!name) {
            return res.status(400).json({
                error: { message: 'Missing name in request body' }
            });
        }
        if (!content) {
            return res.status(400).json({
                error: { message: 'Missing content in request body' }
            });
        }

        const newNote = { name, folder_id, content };

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note));
            })
            .catch(next);
    });

notesRouter
    .route('/:notes_id')
    .all((req, res, next) => {
        NotesService.getNoteById(
            req.app.get('db'),
            req.param.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: 'Note doesn\'t exist' }
                    });
                }
                res.note = note;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note));
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, folder_id, content } = req.body;
        if (!name) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain note name'
                }
            });
        }
        if (!content) {
            return res.status(400).json({
                error: {
                    message: 'Request must contain note content'
                }
            });
        }

        const noteToUpdate = {
            name,
            folder_id,
            content
        };

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = notesRouter; 