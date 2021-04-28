module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        nombre_cliente: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: false
            }
        },
        email_cliente:{
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        telefono_cliente:{
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
        fechaNac_cliente:{
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                notEmpty: false
            }
        }
    });

    return Customer;
};