import { Product, Products, UnitProduct } from "./product.interface";
import { v4 as random } from "uuid";
import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "products.json");

let products: Products = loadProducts();

function loadProducts(): Products {
    try {
        if (!fs.existsSync(filePath)) {
            console.log("users.json not found. Creating a new one...");
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.log(`Error ${error}`);
        return {};
    }
}

function saveProducts() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(products), "utf-8");
        console.log("Products saved successfully!");
    } catch (error) {
        console.log("Error Saving Products", error);
    }
}

export const findAll = async (): Promise<UnitProduct[]> => Object.values(products) || null;

export const findOne = async (id: string): Promise<UnitProduct> => products[id];

export const create = async (productInfo: Product): Promise<null | UnitProduct> => {
    let id = random();

    let product = await findOne(id);

    while (product) {
        id = random();
        await findOne(id);
    }

    products[id] = {
        id: id,
        ...productInfo
    };

    saveProducts();

    return products[id];
};

export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
    const product = await findOne(id);

    if (!product) {
        return null;
    }

    products[id] = {
        id,
        ...updateValues
    };

    saveProducts();

    return products[id];
};

export const remove = async (id: string): Promise<null | void> => {
    const product = await findOne(id);

    if (!product) {
        return null;
    }

    delete products[id];

    saveProducts();
};