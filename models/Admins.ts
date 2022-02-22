/*************************************************************************
ADMINS TABLE
*************************************************************************/

export default (sequelize: any, Sequelize: any) => {
	var Admins = sequelize.define(
		'admins',
		{
			names: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			status: {
				type: Sequelize.ENUM('active', 'suspended'),
				defaultValue: 'active',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Admins.associate = (models: any) => {
		models.admins.hasMany(models.vacancies, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'adminId' });
	};

	return Admins;
};
