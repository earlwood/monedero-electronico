'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

  //Relations

  db.Profile.hasMany(db.User);
  db.User.belongsTo(db.Profile);

  db.Commerce.hasMany(db.User);
  db.User.belongsTo(db.Commerce);
  
  db.Customer.hasMany(db.User);
  db.User.belongsTo(db.Customer);

  db.Commerce.hasMany(db.Customer);
  db.Customer.belongsTo(db.Commerce);
  
  
  db.Customer.hasMany(db.Monedero);
  db.Monedero.belongsTo(db.Customer);

  db.Commerce.hasMany(db.Monedero);
  db.Monedero.belongsTo(db.Commerce);

  db.Monedero.hasMany(db.Historico);
  db.Historico.belongsTo(db.Monedero);

  //Revisar conexión DB
  db.sequelize.authenticate()
  .then(() => {
    console.log('DB is running!!');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = db;
