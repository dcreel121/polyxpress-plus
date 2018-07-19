/**
 * PolyXpress Schemas/Models via Mongoose
 * *** EVENT ***
 */

// Note: add validation to schemas/models

module.exports = function(mongoose) {
    var collection = 'Event';
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var assetTypes = "audio text video imageURL imageEmbed".split(' ');

    var Event = new Schema({
        title: {type: String, required: true},
        teaser: String,
        // NOTE:  Changing "author" to an array...not sure what it means to have a "required" field
        // for an array.
        authors: {type: [{type: Schema.Types.ObjectId, ref: 'User'}], required: true},
        //author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        keywords: [{type: String, lowercase: true}],
        proximity: {type: {lat: Number, lng: Number, range: Number}, required: true},
        assetList: [{order: {type: Number, default: 0}, format: {type: String, enum: assetTypes}, uri: String}],
        created: {type: Date, default: Date.now},
        modified: {type: Date, default: Date.now},
        locK: {type: Boolean, default: false}
    });

    this.model = mongoose.model(collection, Event);

    return this;
};

