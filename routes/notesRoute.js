import express from 'express';
import {Notes} from '../models/notes.js';


const router = express.Router();


router.post ('/', async (req, res) => {
    try {
        if (!req.body.note || !req.body.username || !req.body.index){
            return res.status(500).send({message: `send all required feilds` })
        }
        const newNote = {note: req.body.note , username: req.body.username, index: req.body.index};
        const Note = await Notes.create(newNote);

        return res.status(201).send(Note);
    } catch (error){
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.delete ('/:username/:note', async (req, res) => {
    try {
        const { username, note } = req.params;

        const notes = await Notes.deleteOne({"username" : username, "note" : note });

        if (!notes){
            return res.status(404).json({message : 'Note not found'});
        }

        return res.status(200).send({message : 'Note deleted successfully'});

    } catch (error) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.get('/:username',async (req, res) => {
    try {

        const { username } = req.params;

        const notes = await Notes.find({"username" : username }).sort({ "index": 1 });

        return res.status(200).json({
            length : notes.length,
            data: notes
        });
    }catch {
        console.log(error.message);
        return res.status(500).send({message : error.message});
    }
});

router.put('/movedown/:username/:index', async (req, res) => {
    try {
        const { username, index} = req.params;

        const resultCurrent1 = await Notes.updateOne({"username": username, "index" : index}, {$set: {"index": -1}});

        if (!resultCurrent1){
            return res.status(404).json({message: 'Current Note1 not found'});
        }

        const resultNext = await Notes.updateOne({"username": username, "index" : parseInt(index) + 1}, {$set: {"index": parseInt(index)}});

        if (!resultNext){
            return res.status(404).json({message: 'Next Note not found'});
        }
        
        const resultCurrent2 = await Notes.updateOne({"username": username, "index" : -1}, {$set: {"index": parseInt(index) + 1}});

        if (!resultCurrent2){
            return res.status(404).json({message: 'Current Note2 not found'});
        }

        return res.status(200).send({ message: 'Note updated successfully '})

    } catch (error){
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

router.put('/moveup/:username/:index', async (req, res) => {
    try {
        const { username, index} = req.params;

        const resultCurrent1 = await Notes.updateOne({"username": username, "index" : index}, {$set: {"index": -1}});

        if (!resultCurrent1){
            return res.status(404).json({message: 'Current Note1 not found'});
        }

        const resultNext = await Notes.updateOne({"username": username, "index" : parseInt(index) - 1}, {$set: {"index": parseInt(index)}});

        if (!resultNext){
            return res.status(404).json({message: 'Next Note not found'});
        }
        
        const resultCurrent2 = await Notes.updateOne({"username": username, "index" : -1}, {$set: {"index": parseInt(index) - 1}});

        if (!resultCurrent2){
            return res.status(404).json({message: 'Current Note2 not found'});
        }

        return res.status(200).send({ message: 'Note updated successfully '})

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