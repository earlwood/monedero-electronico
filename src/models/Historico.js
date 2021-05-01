module.exports = (sequelize, DataTypes) => {
    const Historico = sequelize.define('Historico', {
        detalle_vta: {
            type: DataTypes.STRING,
            allowNull: true
        },
        total_vta:{
            type: DataTypes.FLOAT,
            allowNull: true
        },
        monto_abono:{
            type: DataTypes.FLOAT,
            allowNull: true
        },
        monto_cargo:{
            type: DataTypes.FLOAT,
            allowNull: true
        },
        tipo_movimiento:{
            type: DataTypes.STRING,
            allowNull: true
        },
        saldo_actual:{
            type: DataTypes.FLOAT,
            allowNull: true
        },
        saldo_anterior:{
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Historico;
};