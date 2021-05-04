const bcryptJs = require('bcryptjs');
const generatePassword = require('password-generator');
const { format, addDays, eachDayOfInterval } = require('date-fns');

// const models = require('../models');
const { Commerce, User, Monedero, Customer, Historico } = require('../models');

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
        detalle_vta,
        tipo_movimiento,
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
                                            
                                            Historico.create({
                                                detalle_vta,
                                                total_vta: saldo,
                                                MonederoId: rr.dataValues.id,
                                                monto_abono: parseFloat(saldo/resp.dataValues.regla_porcentaje, 10).toFixed(2),
                                                tipo_movimiento,
                                                saldo_actual: rr.dataValues.saldo,
                                                saldo_anterior: 0
                                            })
                                            .then((respuesta) => {
                                                res.json({message: 'Cliente, Monedero e Histórico creados correctamente', Cliente: resultado, Monedero: rr, Historico: respuesta});
                                            })
                                            .catch((fail) => {
                                                res.status(500).json({message: 'Hubo un error al crear el historico', err: fail})
                                            })

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
                                    res.status(500).json({message: 'Hubo un error al crear el cliente', err: ff})
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

    const { saldo, tipo_movimiento, detalle_vta, monto_cargo } = req.body;

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

    User.findOne({where: {profileId: 2, api_key}})
    .then((result) => {

        function addDaysToDate(date, days){
            var res = new Date(date);
            res.setDate(res.getDate() + days);
            return res;
        }
        
        var tmpDate = new Date(); // Today
        // console.log(addDaysToDate(tmpDate, 30)); // today + 2 
    
        let diff = addDaysToDate(tmpDate, 30).getTime() - tmpDate.getTime();
        let msInDay = 1000 * 3600 * 24;
        
        if(result.ProfileId === 2){
            if(tipo_movimiento === 'Abono' || tipo_movimiento === 'abono'){

                Monedero.findOne({where: {id: req.params.id}})
                .then((r) => {

                    const fecha_actualizada = r.dataValues.updatedAt;
                    const vigencia = addDays(fecha_actualizada, r.dataValues.vigencia);
                    // const diasDiferencia = eachDayOfInterval({start: fecha_actualizada, end: vigencia});
                    const diasVigencia = eachDayOfInterval({start: new Date(), end: vigencia});
                    const vig = diasVigencia - 1;

                    if(vig === 0){
                        Monedero.update(
                            { 
                                saldo: 0,
                                vigencia: vig
                            },
                            { where: {id: req.params.id }
                        })
                        .then((vencido) => {
                            Historico.findOne({
                                limit: 1,
                                where: {
                                    MonederoId: req.params.id
                                },
                                order: [['id', 'DESC']]
                            })
                            .then((resp) => {
                                Historico.create({
                                    detalle_vta,
                                    total_vta: saldo,
                                    MonederoId: resp.dataValues.id,
                                    tipo_movimiento: 'Vencimiento',
                                    saldo_actual: 0,
                                    saldo_anterior: resp.dataValues.saldo_actual
                                })
                                .then((respuesta) => {
                                    res.json({message: 'Monedero e Histórico actualizados correctamente', Monedero: r, Historico: respuesta});
                                })
                                .catch((fail) => {
                                    res.status(500).json({message: 'Hubo un error al crear el historico', err: fail})
                                })
                            })
                        })
                        .catch((ven) =>{
                            res.status(500).json({message: 'Hubo un error al actualizar el monedero', err: ven})
                        })
                    }
                    else{
                        Commerce.findOne({where: {id: r.dataValues.CommerceId}})
                        .then((re) =>{
                            const sald = r.dataValues.saldo + (saldo/re.dataValues.regla_porcentaje);
                            Monedero.update(
                                { 
                                    saldo: parseFloat(sald).toFixed(2),
                                    vigencia: diff/msInDay
                                },
                                { where: {id: req.params.id }
                            })
                            .then((mone) => {
                                // res.json({message:'Comercio actualizado correctamente'});
                                // console.log("Monedero LOGGGGG",mone);
                                Historico.findOne({where: {MonederoId: r.dataValues.id}})
                                .then((resp) => {
                                    Historico.create({
                                        detalle_vta,
                                        total_vta: saldo,
                                        MonederoId: r.dataValues.id,
                                        monto_abono: parseFloat(saldo/re.dataValues.regla_porcentaje).toFixed(2),
                                        tipo_movimiento,
                                        saldo_actual: parseFloat(resp.dataValues.saldo_actual + r.dataValues.saldo).toFixed(2),
                                        saldo_anterior: parseFloat(resp.dataValues.saldo_actual + r.dataValues.saldo - (saldo/re.dataValues.regla_porcentaje)).toFixed(2)
                                    })
                                    .then((respuesta) => {
                                        res.json({message: 'Monedero e Histórico actualizados correctamente', Monedero: r, Historico: respuesta});
                                    })
                                    .catch((fail) => {
                                        res.status(500).json({message: 'Hubo un error al crear el historico', err: fail})
                                    })
                                })

                            })
                            .catch((err) => {
                                res.status(500).json({message: 'Error al actualizar el comercio con id de ' + req.params.id})
                            });
                        })
                        .catch((er) => {
                            res.status(500).json({message: 'Error en el servidor', err: er})
                        })
                    }
                    
                })
                .catch((e) => {
                    res.sendStatus(500).json({message: 'Error en el servidor' + e})
                })
            }

            if(tipo_movimiento === 'Cargo' || tipo_movimiento === 'cargo'){
                Monedero.findOne({where: {id: req.params.id}})
                .then((r) => {
                    
                    const fecha_actualizada = r.dataValues.updatedAt;
                    const vigencia = addDays(fecha_actualizada, r.dataValues.vigencia);
                    // const diasDiferencia = eachDayOfInterval({start: fecha_actualizada, end: vigencia});
                    const diasVigencia = eachDayOfInterval({start: new Date(), end: vigencia});
                    const vig = diasVigencia - 1;
                    
                    if(vig === 0){
                        Monedero.update(
                            { 
                                saldo: 0,
                                vigencia: vig
                            },
                            { where: {id: req.params.id }
                        })
                        .then((vencido) => {
                            Historico.findOne({
                                limit: 1,
                                where: {
                                    MonederoId: req.params.id
                                },
                                order: [['id', 'DESC']]
                            })
                            .then((resp) => {
                                Historico.create({
                                    detalle_vta,
                                    total_vta: saldo,
                                    MonederoId: resp.dataValues.id,
                                    tipo_movimiento: 'Vencimiento',
                                    saldo_actual: 0,
                                    saldo_anterior: resp.dataValues.saldo_actual
                                })
                                .then((respuesta) => {
                                    res.json({message: 'Monedero e Histórico actualizados correctamente', Monedero: r, Historico: respuesta});
                                })
                                .catch((fail) => {
                                    res.status(500).json({message: 'Hubo un error al crear el historico', err: fail})
                                })
                            })
                        })
                        .catch((ven) =>{
                            res.status(500).json({message: 'Hubo un error al actualizar el monedero', err: ven})
                        })
                    }
                    else{
                        Commerce.findOne({where: {id: r.dataValues.CommerceId}})
                        .then((re) =>{
                            const sald = parseFloat(r.dataValues.saldo + (saldo/re.dataValues.regla_porcentaje)).toFixed(2);
                            // console.log(parseFloat(sald).toFixed(2));
                            Monedero.update(
                                { 
                                    saldo: sald,
                                    vigencia: diff/msInDay
                                },
                                { where: {id: req.params.id }
                            })
                            .then((mone) => {
                                
                                Historico.findOne({where: {MonederoId: req.params.id}})
                                .then((resp) => {
                                    Historico.create({
                                        detalle_vta,
                                        total_vta: saldo,
                                        MonederoId: r.dataValues.id,
                                        monto_abono: parseFloat(saldo/re.dataValues.regla_porcentaje).toFixed(2),
                                        tipo_movimiento: 'Abono',
                                        saldo_actual: parseFloat(resp.dataValues.saldo_actual + r.dataValues.saldo).toFixed(2),
                                        saldo_anterior: parseFloat(resp.dataValues.saldo_actual + r.dataValues.saldo - (saldo/re.dataValues.regla_porcentaje)).toFixed(2)
                                    })
                                    .then((respuesta) => {
                                        // res.json({message: 'Monedero e Histórico actualizados correctamente', Monedero: r, Historico: respuesta});
                                        // console.log("respuesta ",respuesta);
                                        // res.json({saldoActual: respuesta.dataValues.saldo_actual, monto})
                                        Monedero.findOne({where: {id: req.params.id}})
                                        .then((m) => {
                                            if(m.dataValues.saldo >= monto_cargo){
                                                Monedero.update(
                                                    { 
                                                        saldo: parseFloat(respuesta.dataValues.saldo_actual - monto_cargo).toFixed(2)
                                                    },
                                                    { where: {id: req.params.id }
                                                })
                                                .then((monEdit) => {
                                                    // res.json({monEdit});
                                                    Monedero.findOne({where: {id: req.params.id}})
                                                    .then((mon) => {
                                                        Historico.findOne({
                                                            limit: 1,
                                                            where: {
                                                                MonederoId: req.params.id
                                                            },
                                                            order: [['id', 'DESC']]
                                                        })
                                                        .then((hist) => {
                                                            res.json({historicoActual: hist})
                                                            Historico.create({
                                                                detalle_vta,
                                                                total_vta: saldo,
                                                                MonederoId: req.params.id,
                                                                monto_cargo,
                                                                tipo_movimiento,
                                                                saldo_actual: mon.dataValues.saldo,
                                                                saldo_anterior: hist.dataValues.saldo_actual
                                                            })
                                                            .then((histCreate) => {
                                                                res.json({msg:'Historico de monto Cargo', historico: histCreate})
                                                            })
                                                            .catch((rrror) => {
                                                                res.status(500).json({message: 'Hubo un error al crear el historico', err: rrror})
                                                            })
                                                        })
                                                        .catch((ca) =>{
                                                            res.status(500).json({message: 'Hubo un error al encontrar el historico', err: ca})
                                                        })
                                                        // res.json({ monedero: mon});
                                                        
                                                    })
                                                    .catch((catc) =>{
                                                        res.status(500).json({message: 'Hubo un error al encontrar el monedero', err: catc})
                                                    })
                                                    
                                                    
                                                })
                                                .catch((fff) => {
                                                    res.status(500).json({message: 'Hubo un error al actualizar el monedero', err: fff})
                                                })
                                            }
                                            else{
                                                res.json({message: 'Saldo Insuficiente'})
                                            }
                                        })
                                        .catch((c) =>{
                                            res.status(500).json({message: 'Hubo un error al encontrar el monedero', err: c})
                                        })
                                        
                                    })
                                    .catch((fail) => {
                                        res.status(500).json({message: 'Hubo un error al crear el historico', err: fail})
                                    })
                                })
    
                            })
                            .catch((err) => {
                                res.status(500).json({message: 'Error al actualizar el comercio con id de ' + req.params.id})
                            });
                        })
                        .catch((er) => {
                            res.status(500).json({message: 'Error en el servidor', err: er})
                        })
                    }
                    
                    
                })
                .catch((e) => {
                    res.sendStatus(500).json({message: 'Error en el servidor' + e})
                })
            }
            
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