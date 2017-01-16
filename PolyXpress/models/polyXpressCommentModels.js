/**
 * PolyXpress Schemas/Models via Mongoose
 * *** Comment ***
 */

 module.exports = function(mongoose)
 {

  	var collection = "Comment";
 	var Schema = mongoose.Schema;
 	var ObjectId = Schema.ObjectId;

	var Comment = new Schema(
	{
		user		: {type: Schema.Types.ObjectId, ref: 'User', required: true},
		chapter		: {type: Schema.Types.ObjectId, ref: 'Chapter', required: true},
		text		: {type: String, required: true},
		created		: {type: Date, default: Date.now}
	});

	this.model = mongoose.model(collection, Comment);

    return this;
 }