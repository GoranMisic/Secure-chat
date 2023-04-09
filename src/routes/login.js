import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { db } from '../database.js';


const router = express.Router();
const salt = bcrypt.genSaltSync(8);

function authenticateUser(userName, password) 
{
    const match = db.data.userData.find
    ((user) => user.userName === userName);

    if (!match) {
        return false;
    }

    return bcrypt.compareSync(password, match.password);
}

function createUser(userName, password) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = { userName, password: hashedPassword };

    db.data.userData.push(newUser);
    db.write();

    return newUser;
}

router.post('/', (req, res) => {
    const { userName, password } = req.body;

    if (authenticateUser(userName, password)) {
        const user = db.data.userData.find((user) => user.userName === userName);
        const token = jwt.sign({ userName }, process.env.SECRET, { expiresIn: '1h' });
        res.status(200).send({ user, token });
    } else {
        res.sendStatus(401);
    }
});

router.post('/create', (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        res.sendStatus(400);
        return;
    }

    if (db.data.userData.find((user) => user.userName === userName)) {
        res.sendStatus(409);
        return;
    }

    const newUser = createUser(userName, password);

    res.status(201).send(newUser);
});

export default router;
