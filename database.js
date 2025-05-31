import DBLocal from 'db-local';

// Configuración de db-local
const localDB = DBLocal({path: './db'});
const { Schema } = localDB;

// Exportar db-local Schema para su uso en los modelos
export { Schema };

// No estamos usando PostgreSQL
export const isUsingPostgres = () => false;

export default localDB;
