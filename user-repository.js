//User Repository
import crypto from 'node:crypto'
import getUserModel from './models/user.js';
import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from './config.js';

//User Repository
export class UserRepository {
    static async create ({username, password}) {
        //Validaciones
        Validation.username(username)
        Validation.password(password)

        const User = getUserModel();
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({username});
        if(existingUser) throw new Error('User already exists')

        // Crear nuevo usuario con db-local
        const id = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        await User.create({
            _id: id,
            username,
            password: hashedPassword
        }).save();

        return id;
    }

    static async login ({username, password}) {
        //Validaciones
        Validation.username(username)
        Validation.password(password)

        const User = getUserModel();
        
        // Buscar usuario
        const user = await User.findOne({username});
        if(!user) throw new Error('User not found')

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) throw new Error('Invalid password')

        return user._id;
    }
   
}

//Validation
class Validation {
    static username(username) {
        //Validaciones de usuario
        if(typeof username !== 'string') throw new Error('Username must be a string')
        if(username.length < 3) throw new Error('Username must be at least 3 characters long')
    }
    static password(password){
        //Validaciones de password
        if(typeof password !== 'string') throw new Error('Password must be a string')
        if(password.length < 6) throw new Error('Password must be at least 6 characters long')
    }
}