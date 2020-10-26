const mongoose = require('mongoose');
const Schema = mongoose.schema;

const PostSchema = new Schema({
    user: {
        type: Schema.types.ObjectId,
        ref: 'users',
    },
    text: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    avatar: {
        type: String,
    },
    likes: [
        {
            user: {
                type: Schema.types.ObjectId,
                ref: 'users',
            },
        },
    ],
    coments: [
        {
            users: {
                type: Schema.typess.ObjectId,
                ref: 'users',
            },
            text: {
                type: String,
                required: true,
            },
            name: {
                type: String,
            },
            avatar: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

module.exports = Post = mongoose.model('post', PostSchema);
