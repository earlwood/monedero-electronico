// const bcryptJs = require('bcryptjs');
// const generatePassword = require('password-generator');
const models = require('../models');
const { Customer, Commerce, User } = require('../models');

const getAllCustomers = (req, res) =>{
    Customer.findAll()
    .then((clientes) =>{
        res.send(clientes);
    })
    .catch((err) => {
        console.log(err)
    })    
}

const createCustomer = async (req, res) => {
    
    const { nombre_cliente, email_cliente, telefono_cliente, fechaNac_cliente } = req.body;

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

    // if(email_cliente !== '' || telefono_cliente !== ''){
        Customer.findOne({where: {email_cliente}})
        .then((result) => {
            if(result !== null){
                res.json({message: 'El email ya existe'});
            }
            else{
                Customer.findOne({where: {telefono_cliente}})
                .then((r) => {
                    if(r !== null){
                        res.json({message: 'El teléfono ya existe'}); 
                    }
                    else{

                        User.findOne({where: {profileId: 1, api_key}})
                        .then((result) => {
                            
                            if(result.ProfileId === 1){

                                Customer.create({
                                    nombre_cliente,
                                    email_cliente,
                                    telefono_cliente,
                                    fechaNac_cliente
                                })
                                .then((resultado) => {
                                    res.json({message: 'Cliente creado correctamente', resultado});
                                })
                                .catch((error) => {
                                    res.status(500).json({message: 'Hubo un error al crear el cliente', err: error})
                                })
                            }
                        })
                    }
                })
                .catch((e) => console.log(e));
            }
            
        })
        .catch((error) => {
            res.sendStatus(500).json({message: 'Error en el servidor'})
            console.log("error --> ",error);
        });
    // }
    
    
}

// const updateCommerce = (req, res) => {    
        
//     Commerce.update(
//         req.body
//         ,{
//         where: {id: req.params.id}
//     })
//     .then((user) => {
//         res.json({message:'Comercio actualizado correctamente'});
//     })
//     .catch((err) => {
//         res.status(500).json({message: 'Error al actualizar el comercio con id de ' + req.params.id})
//     });    
// }

async function authenticate({ api_key }) {
    const user = await User.findOne({where: {api_key: api_key}})
    
    if (user) {
        const { api_key, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }
}



module.exports = {getAllCustomers, createCustomer};