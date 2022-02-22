/*************************************************************************
DOCUMENTS TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var Documents = sequelize.define(
		'documents',
		{
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			file: { type: Sequelize.STRING },
		},
		{
			freezeTableName: true,
		}
	);

	Documents.associate = function (models: any) {
		models.documents.belongsTo(models.candidates, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'candidateId' });
	};

	return Documents;
}
