
models = require(__dirname + '/models/user');

var User = models.User;
var Post = models.Post;
var fs = require('fs');


module.exports = function(app, upload){

    function userExist(req, res, next){
        User.count({ username: req.body.username }, 
            function(err, count){
                if(count === 0){
                    next();
                } else {
                    req.flash('error', "User Exist");
                    console.log(req.session.error);
                    res.redirect('/register');
                }
            });
    };

    app.get('/', function (req, res){
        Post.find({}).populate('_user').exec(function(err, allPosts){
            if(!err){
                res.render('main.njk', {
                    posts : allPosts,
                    title : 'Spaurk.net',
                    isLogged : req.session.isLogged,
                    user : req.session.user,
                    messages : req.flash('alert')
                });
            } else { return done(err); }
        });

    });

    app.get('/id/:id', function(req, res, done){
        Post.findById(req.params.id, function(err, post){
            if(err){ return done(err); }
            if(!post){ return res.send(404); }

            post.remove(function(err){
                if(err)
									return done(err);
								fs.unlink('views/static/uploads/' + post.audioFile);
								if(typeof post.imageFile != 'undefined')
									fs.unlink('views/static/uploads/' + post.imageFile);
                res.redirect('/');
            });
        });
    });

    app.get('/admin', function(req, res, done){

        User.find({}, function(err, allUsers){
            if(!err){
                res.render('index.njk', {
                    users : allUsers,
                    title : 'Spaurk.net',
                    isLogged : req.session.isLogged,
                    user : req.session.user,
                    messages : req.flash('alert')
                });
            } else { return done(err); }
        });
    });

    app.get('/admin/id/:id', function(req, res, done){
        User.findById(req.params.id, function(err, user){
            if(err){ return done(err); }
            if(!user){ return res.send(404); }

            user.remove(function(err){
                if(err){ return done(err); }
                res.redirect('/');
            });
        });
    });

    app.get('/register/', function(req, res){
        if(req.session.user){
            res.redirect('/');
        } else {
            res.render('register.njk', { messages: req.flash('alert'), error: req.flash('error') });
        }
    });
    
    app.post('/register/', userExist, function(req, res){
        var password = req.body.password;
        var username = req.body.username;
        var user = new User();
        
        user.username = username;
        user.password = user.generateHash(password);

        user.save(function (err, newUser){
            if(err) throw err;

            if(newUser){
                req.session.regenerate(function(){
                    req.session.user = newUser.username;
                    req.session.id = newUser._id;
                    req.session.isLogged = true;
                    console.log(req.session.user);
                    res.redirect('/');
                });
            }
        });
    });

    app.get('/upload/', function(req, res){
        if(!req.session.isLogged){
            res.redirect('/');
        } else {
            res.render('upload.njk', {
                    title : 'Spaurk.net',
                    isLogged : req.session.isLogged,
                    user : req.session.user,
                    messages : req.flash('alert')
                });
        }
    });

    var manageUpload = upload.fields([{ name: 'fileElem', maxCount: 1 }, { name: 'imageElem', maxCount: 1 } ]);
    app.post('/upload', manageUpload, function(req, res){
        post = new Post();
        
        User.findOne({ username: req.session.user }, function(err, newUser){
            if(err) console.log(err);

            post.audioFile = req.files['fileElem'][0].filename;

            if(typeof req.files['imageElem'] !== "undefined"){
                post.imageFile = req.files['imageElem'][0].filename;
            }

            post._user = newUser._id;
            post.title = req.body.title;
            post.artist = req.body.artist;
            post.start = req.body.start;
            post.stop = req.body.stop;
            post.genre = req.body.genre;
            post.tags = req.body.tags;

            post.save(function(err, newPost){
                if(err) 
                    console.log(err);
                if(newPost){
									req.flash('alert', 'succesfull upload');
									res.redirect('/');
                }
            });
        });
    });


    app.post('/login/', function(req, res){
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ username: username }, function(err, user){
            if(err) throw err;

            if(user && user.validPassword(password) == true){
                req.session.regenerate(function(){
                    req.session.user = user.username;
                    req.session.isLogged = true;
                    res.redirect('/');
                });
            } 

            else{
                req.flash('alert', 'Invalid Username or Password');
                res.redirect('/register');
            }
        });
    });

    app.get('/logout', function(req, res){
        req.session.destroy(function(){
            res.redirect('/');
        });
    });

    app.get('/:user', function(req, res, done){
        User.findOne({ username : req.params.user }, function(err, profileUser){
            if(err){ return done(err); }
            if(!profileUser){ return res.send(404); }

            res.render('profile.njk', {
                profileUser : profileUser,
                user : req.session.user,
                title : profileUser.username + "'s Profile",
                isLogged : req.session.isLogged,
                messages : req.flash('alert')
            });

        });
    });

};

