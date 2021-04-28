const bcryptJs = require('bcryptjs');
const generatePassword = require('password-generator');
// const models = require('../models');
const { Commerce, User, Monedero, Customer } = require('../models');

const getAllMonederos = (req, res) =>{
    Monedero.findAll()
    .then((monederos) =>{
        res.send(monederos);
    })
    .catch((err) => {
        console.log(err)
    })    
}

const createMonedero = async (req, res) => {
    
    const { 
        nombre_Comercial, 
        nombreCompleto_Usuario, 
        logo, 
        regla_porcentaje, 
        email, 
        password, 
        ProfileId, 
        nombre_cliente, 
        email_cliente, 
        telefono_cliente, 
        fechaNac_cliente,
        CommerceId,
        saldo
    } = req.body;

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

                        User.findOne({where: {profileId: 2, api_key}})
                        .then((result) => {
                            
                            if(result.ProfileId === 2){

                                function addDaysToDate(date, days){
                                    var res = new Date(date);
                                    res.setDate(res.getDate() + days);
                                    return res;
                                }
                                
                                var tmpDate = new Date(); // Today
                                // console.log(addDaysToDate(tmpDate, 30)); // today + 2 

                                let diff = addDaysToDate(tmpDate, 30).getTime() - tmpDate.getTime();
                                let msInDay = 1000 * 3600 * 24;
                                // console.log("Registro", tmpDate);
                                // console.log("Vigencia", addDaysToDate(tmpDate, 30));
                                // console.log("Dias de Vigencia", diff/msInDay);

                                Commerce.findOne({where: {id: CommerceId}})
                                .then((resp) => {
                                    Customer.create({
                                        nombre_cliente,
                                        email_cliente,
                                        telefono_cliente,
                                        fechaNac_cliente,
                                        CommerceId
                                    })
                                    .then((resultado) => {
    
                                        Monedero.create({
                                            saldo: parseFloat(saldo/resp.dataValues.regla_porcentaje, 10).toFixed(2),
                                            vigencia: diff/msInDay,
                                            CustomerId: resultado.dataValues.id,
                                            CommerceId: resultado.dataValues.CommerceId
                                        })
                                        .then((rr) => {
                                            res.json({message: 'Cliente y monedero creados correctamente', id: rr.dataValues.id});
                                        })
                                        .catch((er) => {
                                            res.status(500).json({message: 'Hubo un error al crear el monedero', err: er})
                                        })
    
                                    })
                                    .catch((error) => {
                                        res.status(500).json({message: 'Hubo un error al crear el cliente', err: error})
                                    })
                                })
                                .catch((ff) => {

                                })

                                
                            }
                        })
                    }
                })
                .catch((e) => console.log(e));
            }
            
        })
        .catch((f) => {
            res.sendStatus(500).json({message: 'Error en el servidor'})
            console.log("error --> ",f);
        });
}



const updateMonedero = async (req, res) => {

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



module.exports = {getAllMonederos, createMonedero, updateMonedero};