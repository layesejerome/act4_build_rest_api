import fs from "fs";
import path from "path";
import { User, UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";

const filePath = path.resolve(__dirname, "users.json");

function loadUsers(): Users {
    try {
        if (!fs.existsSync(filePath)) {
            console.log("users.json not found. Creating a new one...");
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }

        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.log(`Error loading users: ${error}`);
        return {};
    }
}

let users: Users = loadUsers();

function saveUsers() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
        console.log("Users saved successfully!");
    } catch (error) {
        console.log(`Error saving users: ${error}`);
    }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<UnitUser | null> => users[id] || null;

export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
    let id = random();
    let check_user = await findOne(id);

    while (check_user) {
        id = random();
        check_user = await findOne(id);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user: UnitUser = {
        id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
    };

    users[id] = user;
    saveUsers();

    return user;
};

export const searchUsers = async (name?: string, email?: string): Promise<UnitUser[]> => {
    const allUsers = await findAll();

    return allUsers.filter(
        (user) =>
            (!name || user.username.toLowerCase().includes(name.toLowerCase())) &&
            (!email || user.email.toLowerCase().includes(email.toLowerCase()))
    );
};

export const findbyEmail = async (user_email: string): Promise<UnitUser | null> => {
    return (await findAll()).find((user) => user.email === user_email) || null;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
    const user = await findbyEmail(email);

    if (!user) return null;

    const isMatch = await bcrypt.compare(supplied_password, user.password);
    return isMatch ? user : null;
};

export const update = async (id: string, updateValues: Partial<User>): Promise<UnitUser | null> => {
    const userExists = await findOne(id);

    if (!userExists) return null;

    if (updateValues.password) {
        const salt = await bcrypt.genSalt(10);
        updateValues.password = await bcrypt.hash(updateValues.password, salt);
    }

    users[id] = { ...userExists, ...updateValues };
    saveUsers();

    return users[id];
};

export const remove = async (id: string): Promise<void | null> => {
    if (!(await findOne(id))) return null;

    delete users[id];
    saveUsers();
};