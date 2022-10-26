const mongoose = require('mongoose')

const superheroSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		alias: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Superhero', superheroSchema)