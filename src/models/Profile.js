module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        profileName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    });

    return Profile;
};