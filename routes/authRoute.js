import express from 'express';
import jwt from 'jsonwebtoken';
import {users} from '../models/users.js';
import {Auth} from '../models/auth.js';

const router = express.Router();

router.post('/login', async(req, res) => {

    const { username, password } = req.body;
    const user = await users.findOne({"username" : username , "password" : password});
    console.log(user);
    if (!user) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }

    const payload = {
        id: user._id, 
        username: user.username 
    };

    const accessToken = generateAccessToken(payload);
    // const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    // res.json({ accessToken: accessToken, refreshToken: refreshToken });
    res.json({ accessToken: accessToken});
})

router.post('/register', async(req, res) => {
    
    try {
        if (!req.body.username || !req.body.password){
            return res.status(500).send({message: `send all required feilds` })
        }
        const { username, password } = req.body;
        const existingUser = await users.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = {
            username: username,
            password: password
        };
        const user = await users.create(newUser);
        return res.status(201).send(user);
    } catch (error){
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

router.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null){
        return res.status(401).send({message : "Token not sent"});
    }
    const token = await Auth.findOne({"refreshToken" : refreshToken});
    if (token == null){
        return res.status(403).send({message : "token not in db"});
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err){
            return res.status(403).send({message : "Invalid token"})
        }
        const accessToken = generateAccessToken({ name: user.name});
        res.json({ accessToken: accessToken});
    })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null){
        return res.status(401).send({message: "token not sent"});
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err){
            return res.status(403).send({message: "Invalid token"});
        }
        req.username = user.username;
        next();
    })
}

router.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Authorized', username: req.username});
});

export default router;