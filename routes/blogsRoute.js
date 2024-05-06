import express from 'express';
import jwt from 'jsonwebtoken';
import {Blogs} from '../models/blogs.js';
import {users} from '../models/users.js';

const router = express.Router();


router.post ('/',authenticateToken , async (req, res) => {
    try {
        if (!req.body.title || !req.body.username || !req.body.content || !req.body.tag){
            return res.status(500).send({message: `send all required feilds` })
        }
        const newBlog = {title: req.body.title , username: req.body.username, content: req.body.content, tag: req.body.tag};
        const Blog = await Blogs.create(newBlog);

        return res.status(201).send(Blog);
    } catch (error){
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.delete ('/:id',authenticateToken , async (req, res) => {
    try {
        const { id } = req.params;

        const blogs = await Blogs.deleteOne({"_id" : id });

        if (!blogs){
            return res.status(404).json({message : 'Blog not found'});
        }

        return res.status(200).send({message : 'Blog deleted successfully'});

    } catch (error) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.get('/' ,async (req, res) => {
    try {
        const blogs = await Blogs.find().sort({ "createdAt": -1 }).limit(18);

        return res.status(200).json({
            length : blogs.length,
            data: blogs
        });
    }catch(error) {
        console.log(error.message);
        return res.status(500).send({message : error.message});
    }
});

router.get('/update/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const blogs = await Blogs.find({ "username": username }).sort({ "createdAt": -1 });
        
        return res.status(200).json({
            length : blogs.length,
            data: blogs
        });
    }catch(error) {
        console.log(error.message);
        return res.status(500).send({message : error.message});
    }
});

router.get('/:id',async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blogs.findOne( {"_id" : id});

        return res.status(200).json(blog);
    }catch(error) {
        console.log(error.message);
        return res.status(500).send({message : error.message});
    }
});

router.get('/username',async (req, res) => {
    try {
        const { username } = req.body.id;
        const user = await users.findOne( {"_id" : id});

        return res.status(200).json(user);
    }catch(error) {
        console.log(error.message);
        return res.status(500).send({message : error.message});
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        const Blog = await Blogs.findByIdAndUpdate(id, req.body, {new: true});

        if (!Blog) {
            return res.status(404).send({message: 'No blog found with the given id'});
        }
        return res.status(200).send(Blog);
    } catch (error){
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.put('/movedown/:username/:index', async (req, res) => {
    try {
        const { username, index} = req.params;

        const resultCurrent1 = await Blogs.updateOne({"username": username, "index" : index}, {$set: {"index": -1}});

        if (!resultCurrent1){
            return res.status(404).json({message: 'Current Blog1 not found'});
        }

        const resultNext = await Blogs.updateOne({"username": username, "index" : parseInt(index) + 1}, {$set: {"index": parseInt(index)}});

        if (!resultNext){
            return res.status(404).json({message: 'Next Blog not found'});
        }
        
        const resultCurrent2 = await Blogs.updateOne({"username": username, "index" : -1}, {$set: {"index": parseInt(index) + 1}});

        if (!resultCurrent2){
            return res.status(404).json({message: 'Current Blog2 not found'});
        }

        return res.status(200).send({ message: 'Blog updated successfully '})

    } catch (error){
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

router.put('/moveup/:username/:index', async (req, res) => {
    try {
        const { username, index} = req.params;

        const resultCurrent1 = await Blogs.updateOne({"username": username, "index" : index}, {$set: {"index": -1}});

        if (!resultCurrent1){
            return res.status(404).json({message: 'Current Blog1 not found'});
        }

        const resultNext = await Blogs.updateOne({"username": username, "index" : parseInt(index) - 1}, {$set: {"index": parseInt(index)}});

        if (!resultNext){
            return res.status(404).json({message: 'Next Blog not found'});
        }
        
        const resultCurrent2 = await Blogs.updateOne({"username": username, "index" : -1}, {$set: {"index": parseInt(index) - 1}});

        if (!resultCurrent2){
            return res.status(404).json({message: 'Current Blog2 not found'});
        }

        return res.status(200).send({ message: 'Blog updated successfully '})

    } catch (error){
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

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
        req.user = user;
        next();
    })
}

export default router;