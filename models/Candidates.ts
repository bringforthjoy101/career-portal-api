/*************************************************************************
CANDIDATES TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var Candidates = sequelize.define(
		'candidates',
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
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'active',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Candidates.associate = function (models: any) {
		models.candidates.hasMany(models.documents, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'candidateId' });
		models.candidates.hasMany(models.applications, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'candidateId' });
	};

	return Candidates;
}
