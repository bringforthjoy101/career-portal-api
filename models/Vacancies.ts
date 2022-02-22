/*************************************************************************
VACANCIES TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var Vacancies = sequelize.define(
		'vacancies',
		{
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			closedAt: { type: Sequelize.DATE },
			status: {
				type: Sequelize.ENUM('open', 'closed'),
				defaultValue: 'open',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Vacancies.associate = function (models: any) {
		models.vacancies.hasMany(models.applications, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'vacancyId' });
		models.vacancies.belongsTo(models.admins, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'adminId' });
	};

	return Vacancies;
}
