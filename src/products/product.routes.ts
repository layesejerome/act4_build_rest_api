import express, { Request, Response } from "express";
import { Product, UnitProduct } from "./product.interface";
import * as database from "./product.database";
import { StatusCodes } from "http-status-codes";

export const productRouter = express.Router();

productRouter.get('/products', async (_req: Request, res: Response): Promise<void> => {
    try {
        const allProducts = await database.findAll();

        if (!allProducts || allProducts.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'No products found!' });
            return;
        }

        res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

productRouter.get('/product/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await database.findOne(req.params.id);

        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Product does not exist' });
            return;
        }

        res.status(StatusCodes.OK).json({ product });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

productRouter.post("/product", async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, quantity, image } = req.body;

        if (!name || !price || !quantity || !image) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters..` });
            return;
        }

        const newProduct = await database.create({ ...req.body });
        res.status(StatusCodes.CREATED).json({ newProduct });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

productRouter.put("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const newProduct = req.body;
        const findProduct = await database.findOne(id);

        if (!findProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `Product does not exist..` });
            return;
        }

        const updateProduct = await database.update(id, newProduct);
        res.status(StatusCodes.OK).json({ updateProduct });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});

productRouter.delete("/product/:id", async (req: Request, res: Response): Promise<void> => {
    try {
        const getProduct = await database.findOne(req.params.id);

        if (!getProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: `No product with ID ${req.params.id}` });
            return;
        }

        await database.remove(req.params.id);
        res.status(StatusCodes.OK).json({ msg: `Product deleted..` });
        return;
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        return;
    }
});