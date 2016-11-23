
var express     = require('express'),
    app         = express(),
    port        = process.env.PORT || 8080, 
    mongoose    = require('mongoose'),
    nunjucks    = require('nunjucks'),
    flash       = require('connect-flash');

var bodyParser  = require('body-parser'),
    multer      = require('multer'),
    upload      = multer({ dest: __dirname + '/views/static/uploads/' }),
    session     = require('express-session');    
    

//configure db
var configDb = require(__dirname + '/config/database.js');
mongoose.connect(configDb.url);

//configure session
app.use(session({
    secret: 'I tsgw 337',
    resave: true,
    saveUnitialized: true
}));

app.use(flash());

//moving html data around easier
app.use(bodyParser({ extened: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set up routing and template engine
app.use(express.static(__dirname + '/views/static/'));
app.set('view engine', 'nunjucks');
require(__dirname + '/app/routes.js')(app, upload);

//configure nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

//listen for a connection
app.listen(3000, function(){
    console.log('listening on port 3000.');
});

