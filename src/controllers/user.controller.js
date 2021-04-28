const bcryptJs = require('bcryptjs');

const models = require('../models');
const { User } = require('../models');
const generatePassword = require('password-generator');

const getAllUsers = (req, res) =>{
    User.findAll()
    .then((users) =>{
        res.send(users);
    })
    .catch((err) => {
        console.log(err)
    })    
}

const createUserRoot = (req, res) => {
    
    const { nombreCompleto_Usuario, email, password, ProfileId } = req.body;

    User.findOne({where: {email}})
    .then((result) => {
        // console.log(result !== null);
        if(result !== null){
            res.json({message: 'El Email ya existe'});            
            console.log("result", result);
        }
        else{
            console.log("result -->",result);
            bcryptJs.genSalt(10, (err, salt)=>{
                bcryptJs.hash(password, salt, (error, hash) =>{
                    User.create({
                        nombreCompleto_Usuario, 
                        email, 
                        password: hash,
                        api_key: generatePassword(32, false),
                        api_secret: generatePassword(32, false),
                        ProfileId
                    })
                    .then((user) => user ? res.json({message:'Usuario creado exitosamente'}) : res.json({message:'Hubo un error al crear el usuario'}))
                    .catch((err) => {
                        res.status(500).json({message: 'Hubo un error al crear el usuario', err: err})
                    });
                })
            })
        }
    })
    .catch((error) => {
        res.sendStatus(500).json({message: 'Error en el servidor'})
        console.log("error --> ",error);
    });
    
}

const createUserStore = async (req, res) => {
    
    const { nombreCompleto_Usuario, email } = req.body;

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [api_key, api_secret] = credentials.split(':');
    const user = await authenticate({ api_key, api_secret });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    User.findOne({where: {email}})
    .then((r) => {
        if(r !== null){
            res.json({message: 'El Email ya existe'});            
            console.log("result", result);
        }
        else{
            User.findOne({where: {profileId: 1, api_key, api_secret}})
            .then((result) => {
                
                    if(result.ProfileId === 1){
                        User.create({
                            nombreCompleto_Usuario, 
                            email,
                            // password: generatePassword(32, false),
                            api_key: generatePassword(32, false),
                            api_secret: generatePassword(32, false),
                            ProfileId: 2
                        })
                        .then((user) => user ? res.json({message:'Usuario creado exitosamente'}) : res.json({message:'Hubo un error al crear el usuario'}))
                        .catch((err) => {
                            res.status(500).json({message: 'Hubo un error al crear el usuario', err: err})
                        });
                    }
            })
            .catch((error) => {
                res.sendStatus(500).json({message: 'Error en el servidor'})
                console.log("error --> ",error);
            });
        }
    })
    .catch((e) => {
        res.sendStatus(500).json({message: 'Error en el servidor'})
        console.log("error --> ",e);
    })
}

async function authenticate({ api_key, api_secret }) {
    const user = await User.findOne({where: {api_key: api_key, api_secret: api_secret}})
    
    if (user) {
        const { api_secret, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }
}

// const login = (req, res) => {
//     const { email, password } = req.body;

//     User.findOne({where: {email}})
//     .then((result) => {
//         if(result === null){
//             res.sendStatus(401).json({message: "Credenciales invalidas"})
//         }
//         else{
//             bcryptJs.compare(password, result.password, (error, re)  => {
//                 if(re){
//                     res.json({message: "Inicio de Sesión satisfactorio"})
//                 }
//                 else{
//                     res.sendStatus(401).json({message: "Credenciales invalidas"})
//                 }

//             });
//         }
//         console.log(result);
//     })
//     .catch((err) =>{
//         console.log(err);
//     })
// }

module.exports = {
    getAllUsers, 
    createUserRoot,
    createUserStore
    // login
}