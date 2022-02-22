/*************************************************************************
APPLICATIONS TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var Applications = sequelize.define(
		'applications',
		{
			status: {
				type: Sequelize.ENUM('pending', 'approved', 'declined'),
				defaultValue: 'pending',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Applications.associate = function (models: any) {
		models.applications.belongsTo(models.vacancies, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'vacancyId' });
		models.applications.belongsTo(models.candidates, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'candidateId' });
	};

	return Applications;
}
