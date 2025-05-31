import { Schema } from '../database.js';

// Modelo db-local
const UserLocal = Schema('User', {
  _id: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
});

// Función para obtener el modelo
const getUserModel = () => UserLocal;

export default getUserModel;
