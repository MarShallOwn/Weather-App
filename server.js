const express = require('express'), // Express to run server and routes
    cors = require('cors'),
    bodyParser = require('body-parser'),
    app = express(); // Start up an instance of app

      
// Setup empty JS object to act as endpoint for all routes
const projectData = [];

/* Middleware*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('website'));

const server = app.listen(8000);

// Callback function to complete GET '/sendData'
app.get('/sendData', (req, res) => {
    res.send(projectData[0]);
});


// Post Route
app.post('/storeData', (req, res) => {

    projectData.unshift(req.body);
})