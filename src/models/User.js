module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        nombreCompleto_Usuario:{
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password:{
            type: DataTypes.STRING,
            allowNull: true
        },
        api_key:{
            type: DataTypes.STRING(32),
        },
        api_secret:{
            type: DataTypes.STRING(32),
        }
    });

    return User;
};