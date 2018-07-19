/**
 * PolyXpress Schemas/Models via Mongoose
 * *** MESSAGE ***
 */

 module.exports = function(mongoose)
 {

  	var collection = "Message";
 	var Schema = mongoose.Schema;
 	var ObjectId = Schema.ObjectId;

	var Message = new Schema(
	{
		text 		: {type: String, required: true},
		receiver	: {type: Schema.Types.ObjectId, ref: 'User', required: true},
		sender		: {type: Schema.Types.ObjectId, ref: 'User', required: true},		
		event		: {type: Schema.Types.ObjectId, ref: 'Event', required: true},
		chapter		: {type: Schema.Types.ObjectId, ref: 'Chapter', required: true},
		story		: {type: Schema.Types.ObjectId, ref: 'Story', required: true},
		seen		: {type: Boolean, default: false},
		created		: {type: Date, default: Date.now}
	});

	this.model = mongoose.model(collection, Message);

    return this;
 }