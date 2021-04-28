module.exports = (sequelize, DataTypes) => {
    const Monedero = sequelize.define('Monedero', {
        saldo: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        vigencia:{
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    });

    return Monedero;
};