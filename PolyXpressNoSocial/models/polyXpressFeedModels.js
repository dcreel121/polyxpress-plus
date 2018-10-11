/**
 * PolyXpress Schemas/Models via Mongoose
 * *** FEED ***
 */

 module.exports = function(mongoose)
 {

  	var collection = "Feed";
 	var Schema = mongoose.Schema;
 	var ObjectId = Schema.ObjectId;

	var Feed = new Schema(
	{
		user		: {type: Schema.Types.ObjectId, ref: 'User', required: true},
		story		: {type: Schema.Types.ObjectId, ref: 'Story', required: true},
		facebookId 	: {type: String, required: true},
		action		: {type: String, required: true},
		city		: {type: String},
        location	: {type: [Number], index:'2d', required: true},
		created		: {type: Date, default: Date.now}
	});

	this.model = mongoose.model(collection, Feed);

    return this;
 }