import app from 
app.engine('hbs', hbs);
app.set('view engine', 'hbs');

var bodyParser = require('body-parser');

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(XPathExpression.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/slack/interactive', (req, res) => {
    res.send('Received :fire:');
});

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

app.get('/connect', async function (req, res) {
    if (!req.query.auth_id) {

    }
})