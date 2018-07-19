/**
 * PolyXpress Schemas/Models via Mongoose
 * *** CHAPTER ***
 */

// Note: add validation to schemas/models

module.exports = function(mongoose)
{
    var collection = 'Chapter';
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var Chapter = new Schema(
            {
                title: {type: String, required: true},
                teaser: String,
                // NOTE:  Changing "author" to an array...not sure what it means to have a "required" field
                // for an array.
                authors: {type: [{type: Schema.Types.ObjectId, ref: 'User'}], required: true},
                //author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
                keywords: [{type: String, lowercase: true}],
                overview: String,
                image: String, // Any url (Flickr works well)
                proximity: {type: {lat: Number, lng: Number, range: Number}, required: true},
                eventList: [{type: Schema.Types.ObjectId, ref: 'Event'}],
                created: {type: Date, default: Date.now},
                modified: {type: Date, default: Date.now},
                lock: {type: Boolean, default: false}
            });

    this.model = mongoose.model(collection, Chapter);

    return this;
};

