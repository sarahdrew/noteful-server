const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*')
            .from('folders');
    },
    getBoomarkById(knex, id) {
        return knex.from('folders').
            select('*')
            .where('id', id)
            .first();
    },
    insertFolder(knex, newFolder) {
        return knex.insert(newFolder)
            .into('folders')
            .returning('*')
            .then(rows => rows[0]);
    },
    deleteFolder(knex, id) {
        return knex('folders')
            .where('id', id)
            .delete();
    },
    updateFolder(knex, id, newFolderFields) {
        return knex.from('folders')
            .select('*')
            .where('id', id).first()
            .update(newFolderFields)
            .returning('*')
            .then(rows => rows[0]);
    }
};

module.exports = FoldersService;