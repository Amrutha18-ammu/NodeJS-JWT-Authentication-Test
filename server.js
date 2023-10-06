const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt'); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next()
});

const PORT = 3000;

const secretKey = "My super secret key";
const jwtMW = exjwt.expressjwt({ 
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'amrutha',
        password: '123'

    },
    {
        id: 2,
        username: 'varun',
        password: '123456'

    }
];


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;
    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            console.log(token)
            res.json({
                success: true,
                err: null,
                token
            });
            userFound = true;
            break;
        }
    }

    if (!userFound) {
        res.status(401).json({
            success: false,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json ({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    console .log (req)
    res.json ({
        success: true,
        myContent: 'Authorized to access settings page.'
    });
});

app.get('/', (req, res) => {
    console.log("request received")
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err,req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
}); 