import express, { Request, Response } from "express";
import { UnitUser, User } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (_req: Request, res: Response): Promise<void> => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (!allUsers || allUsers.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ msg: "No users at this time." });
            return;
        }

        res.status(StatusCodes.OK).json({ total: allUsers.length, allUsers });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

userRouter.get("/user/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const user: UnitUser | null = await database.findOne(req.params.id);

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "User not found!" });
            return;
        }

        res.status(StatusCodes.OK).json(user);
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

userRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters.." });
            return;
        }

        const user = await database.findbyEmail(email);

        if (user) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "This email has already been registered.." });
            return;
        }

        const newUser = await database.create(req.body);

        res.status(StatusCodes.CREATED).json(newUser);
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

userRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters.." });
            return;
        }

        const user = await database.findbyEmail(email);

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided.." });
            return;
        }

        const comparedPassword = await database.comparePassword(email, password);

        if (!comparedPassword) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Incorrect Password!" });
            return;
        }

        res.status(StatusCodes.OK).json(user);
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

userRouter.put("/user/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username && !email && !password) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide at least one field to update." });
            return;
        }

        const getUser = await database.findOne(req.params.id);

        if (!getUser) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
            return;
        }

        const updatedUser = await database.update(req.params.id, req.body);

        res.status(StatusCodes.OK).json(updatedUser);
        return;
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const user = await database.findOne(id);

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "User does not exist" });
            return;
        }

        await database.remove(id);

        res.status(StatusCodes.OK).json({ msg: "User deleted" });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});
