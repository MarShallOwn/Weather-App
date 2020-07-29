const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    app = express();

const storeData = [];

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('website'));

const server = app.listen(8000);


app.get('/sendData', (req, res) => {
    res.send(storeData);
});

app.post('/storeData', (req, res) => {

    storeData.unshift(req.body);
})