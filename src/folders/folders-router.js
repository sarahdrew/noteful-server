const express = require('express');
const xss = require('xss');

const FoldersService = require('./folders-service');
const path = require('path');

const foldersRouter = express.Router();
const bodyParser = express.json();

function sanitizeFolder(folder) {
    //sanititze name
    const sanitizedFolder = {
        id: folder.id,
        name: xss(folder.name),
    };
    if (folder.description) {

        sanitizedFolder.description = xss(folder.description);
    }
    return sanitizedFolder;
}

foldersRouter
    .route('/api/folders')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(folder => sanitizeFolder(folder)));
            })
            .catch(next);
    })
    .post(bodyParser, (req, res, next) => {
        //const knexInstance = req.app.get('db');
        let { name } = req.body;
        let newFolder = { name };

        for (const [key, value] of Object.entries(newFolder)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                });
            }
        }

        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                logger.info(`Created folder with id ${folder.id}.`);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(sanitizeFolder(folder));
            })
            .catch(next);
    });



foldersRouter
    .route('/api/folders/:folderId')
    .all((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id)

            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                return res.json(folders.map(folder => sanitizeFolder(folder)));
            })
            .catch(next)
            .patch(jsonParser, (req, res, next) => {
                const { name } = req.body
                const folderToUpdate = { name }

                const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
                if (numberOfValues === 0)
                    return res.status(400).json({
                        error: {
                            message: `Request body must contain either 'name'`
                        }
                    })

                FoldersService.updateFolders(
                    req.app.get('db'),
                    req.params.folder_id,
                    folderToUpdate
                )
                    .then(numRowsAffected => {
                        res.status(204).end()
                    })
                    .catch(next)
            })

            .delete((req, res, next) => {
                FoldersService.deleteFolder(
                    req.app.get('db'),
                    req.params.folderId)
                    .then(numRowsAffected => {
                        res.status(204).end()
                    })
                    .catch(next);
            });

    })


module.exports = foldersRouter;