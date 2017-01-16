/**
 * PolyXpress Schemas/Models via Mongoose
 * *** USER ***
 */

// Note: add validation to schemas/models

module.exports = function(mongoose)
{
    var collection = 'User';
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var User = new Schema(
            {
                facebook : {
                    id: {type: Number},
                    username: {type: String},
                    token: {type: String},
                    email: {type: String},
                    friends: {type: Array},
                    picture: {type: String}
                },
                twitter : {
                    id: {type: Number},
                    username: {type: String},
                    token: {type: String}
                },
                google : {
                    id: {type: Number},
                    username: {type: String},
                    token: {type: String},
                    email: {type: String}
                },

                //id: {type: Number, required: true, unique: true},

                name: {type: String, required: true},

                // below, took out "unique: true".  Learned not all facebook users
                // have a username.  Some use their email addresses.  In config,
                // could check for the existance of a username and if it doesn't
                // exist then set their username to their email.  Waiting for
                // further testing before doing this.
                username: {type: String, lowercase: true},
                email: {type: String, lowercase: true},
                authorList: [{type: Schema.Types.ObjectId, ref: 'Story'}],
                readingList: [{type: Schema.Types.ObjectId, ref: 'Story'}],
                storyCompletedList: [{type: Schema.Types.ObjectId, ref: 'Story'}],
                chapterCompletedList: [{type: Schema.Types.ObjectId, ref: 'Chapter'}],
                eventCompletedList: [{type: Schema.Types.ObjectId, ref: 'Event'}],
                created: {type: Date, default: Date.now},
                modified: {type: Date, default: Date.now}
            });

    this.model = mongoose.model(collection, User);

    return this;
};

