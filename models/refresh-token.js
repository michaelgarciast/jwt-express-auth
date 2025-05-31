import { Schema } from '../database.js';
import crypto from 'node:crypto';

// Modelo para almacenar tokens de refresh
const RefreshTokenSchema = Schema('RefreshToken', {
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  token: { type: String, required: true },
  createdAtTimestamp: { type: Number, required: true }, // Usar timestamp en lugar de Date
  expiresAtTimestamp: { type: Number, required: true }, // Usar timestamp en lugar de Date
  isRevoked: { type: Boolean, required: true }
});

// Función para obtener el modelo
const getRefreshTokenModel = () => RefreshTokenSchema;

export default getRefreshTokenModel;

// Funciones auxiliares para trabajar con tokens de refresh
export const createRefreshToken = async (userId, token, expiryDays = 7) => {
  const RefreshToken = getRefreshTokenModel();
  const id = crypto.randomUUID();
  
  const now = Date.now(); // Timestamp actual en milisegundos
  const expiresAt = now + (expiryDays * 24 * 60 * 60 * 1000); // Timestamp de expiración
  
  const tokenDoc = await RefreshToken.create({
    _id: id,
    userId,
    token,
    createdAtTimestamp: now,
    expiresAtTimestamp: expiresAt,
    isRevoked: false
  }).save();
  
  return tokenDoc;
};

export const findRefreshToken = async (token) => {
  const RefreshToken = getRefreshTokenModel();
  return await RefreshToken.findOne({ token });
};

export const revokeRefreshToken = async (token) => {
  const RefreshToken = getRefreshTokenModel();
  const tokenDoc = await RefreshToken.findOne({ token });
  
  if (tokenDoc) {
    tokenDoc.isRevoked = true;
    await tokenDoc.save();
    return true;
  }
  
  return false;
};

export const cleanupExpiredTokens = async () => {
  const RefreshToken = getRefreshTokenModel();
  const now = Date.now(); // Timestamp actual
  
  const allTokens = await RefreshToken.find({});
  const expiredTokens = allTokens.filter(token => 
    token.expiresAtTimestamp < now || token.isRevoked
  );
  
  for (const token of expiredTokens) {
    await RefreshToken.deleteOne({ _id: token._id });
  }
  
  return expiredTokens.length;
};