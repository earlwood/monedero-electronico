const bcryptJs = require('bcryptjs');
const generatePassword = require('password-generator');
// const models = require('../models');
const { Historico, User, Monedero } = require('../models');

const getAllHistorico = (req, res) =>{
    Historico.findAll()
    .then((historico) =>{
        res.send(historico);
    })
    .catch((err) => {
        console.log(err)
    })    
}

const createHistorico = async (req, res) => {
    
    const { nombre_Comercial, nombreCompleto_Usuario, logo, regla_porcentaje, email, password, ProfileId } = req.body;

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [api_key] = credentials.split(':');
    const user = await authenticate({ api_key });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    Commerce.findOne({where: {nombre_Comercial}})
    .then((r) => {
        
        if(r !== null){
            res.json({message: 'El nombre comercial ya existe'});
        }
        else{
            User.findOne({where: {profileId: 1, api_key}})
            .then((result) => {
                
                if(result.ProfileId === 1){
                    Commerce.create({
                        nombre_Comercial,
                        nombreCompleto_Usuario,
                        logo,
                        regla_porcentaje,
                        estatus: false
                    })
                    .then((resultado) => {
                        // console.log(resultado.dataValues.id);
                        User.findOne({where: {email}})
                        .then((correo) => {
                            
                            if(correo !== null){
                                res.json({message: 'El Email ya existe'});            
                                Commerce.destroy({ where: {id: resultado.dataValues.id} })
                                .then((user) => user > 0 ? res.json({message: 'Deleted commerce successfully'}) : res.json({message: 'Commerce not found'}))
                                .catch((err) => {
                                    res.status(500).json({message: 'Error deleting commerce with id=' + resultado.dataValues.id})
                                });
                            }
                            else{
                                // console.log("correo -->",correo);
                                // bcryptJs.genSalt(10, (err, salt)=>{
                                //     bcryptJs.hash(password, salt, (error, hash) =>{
                                        User.create({
                                            nombreCompleto_Usuario,
                                            email, 
                                            // password: hash,
                                            api_key: generatePassword(32, false),
                                            api_secret: generatePassword(32, false),
                                            ProfileId,
                                            CommerceId: resultado.dataValues.id
                                        })
                                        .then((user) => user ? res.json({message:'Comercio y Usuario creados exitosamente'}) : res.json({message:'Hubo un error al crear el usuario'}))
                                        .catch((err) => {
                                            res.status(500).json({message: 'Hubo un error al crear el usuario', err: err})
                                        });
                                //     })
                                // })
                            }
                        })
                    })
                    .catch((error) => {
                        res.status(500).json({message: 'Hubo un error al crear el comercio', err: error})
                    })
                }
            })
            // .then((comercio) => comercio ? res.json({message:'Comercio creado exitosamente'}) : res.json({message:'Hubo un error al crear el comercio'}))
            // .catch((err) => {
            //     res.status(500).json({message: 'Hubo un error al crear el comercio', err: err})
            // });
        }
    })
    .catch((error) => {
        res.sendStatus(500).json({message: 'Error en el servidor'})
        console.log("error --> ",error);
    });
    
}



const updateHistorico = async (req, res) => {

    const { nombre_Comercial, logo, regla_porcentaje} = req.body;

    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [api_key] = credentials.split(':');
    const user = await authenticate({ api_key });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    User.findOne({where: {profileId: 1, api_key}})
    .then((result) => {
        
        if(result.ProfileId === 1){
            Commerce.update(
                // req.body,
                { 
                    nombre_Comercial,
                    logo,
                    regla_porcentaje,
                    estatus: true 
                },
                { where: {id: req.params.id }
            })
            .then((user) => {
                res.json({message:'Comercio actualizado correctamente'});
            })
            .catch((err) => {
                res.status(500).json({message: 'Error al actualizar el comercio con id de ' + req.params.id})
            });
        }
    })
}

async function authenticate({ api_key }) {
    const user = await User.findOne({where: {api_key: api_key}})
    
    if (user) {
        const { api_key, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }
}



module.exports = {getAllHistorico, createHistorico, updateHistorico};