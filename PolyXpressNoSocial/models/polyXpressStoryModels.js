/**
 * PolyXpress Schemas/Models via Mongoose
 * *** STORY ***
 */

// Note: add validation to schemas/models

module.exports = function(mongoose) {
    var collection = 'Story';
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var Story = new Schema({
        title: {type: String, required: true},
        // NOTE:  Changing "author" to an array...not sure what it means to have a "required" field
        // for an array.
        authors: {type: [{type: Schema.Types.ObjectId, ref: 'User'}], required: true},
        publish: {type: Boolean, default: false},
        test: {type: Boolean, default: false},
        keywords: [{type: String, lowercase: true}],
        overview: String,
        image: String, // any URL (Flickr works)
        proximity: {type: {lat: Number, lng: Number, range: Number}, required: true},
        chapterList: [{type: Schema.Types.ObjectId, ref: 'Chapter'}],
        created: {type: Date, default: Date.now},
        modified: {type: Date, default: Date.now},
        lock: {type: Boolean, default: false}
    });

    this.model = mongoose.model(collection, Story);

    return this;
};

