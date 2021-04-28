const models = require('../models');
const { Profile } = require('../models');

const createProfile = (req, res) => {

    const { profileName } = req.body;

    Profile.create({
        profileName
    })
    .then((perf) => perf ? res.json({message:'Perfil creado exitosamente'}) : res.json({message:'Hubo un error al crear el perfil'}))
    .catch((err) => {
        res.status(500).json({message: 'Hubo un error al crear el perfil', err})
    });
}

module.exports = {createProfile}