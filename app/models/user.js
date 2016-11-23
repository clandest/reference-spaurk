
var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email:  String,
    created_at: Date,
    updated_at: Date,
    admin: Boolean,
    posts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }]
});

var postSchema = new mongoose.Schema({
    _user : [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    audioFile: { type: String, required: true },
    imageFile: { type: String },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    start: { type: String, required: true },
    stop: { type: String, required: true },
    genre: { type: String, required: true },
    tags: [{ type: String }]

});


userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password, callback){
    return bcrypt.compareSync(password, this.password, callback);
};

var User = mongoose.model('User', userSchema);
var Post = mongoose.model('Post', postSchema);

module.exports = {
    User: User,
    Post: Post
};
