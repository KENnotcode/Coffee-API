const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { v4: uuid } = require("uuid");

const app = express();

// CORS configuration
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://github.com/KENnotcode/DailyRoast'], // Allow requests from both origins
    methods: ['GET', 'POST', 'FETCH'], // Specify allowed methods
    credentials: true, // Allow credentials (optional)
}));

app.get("/outfit", (req, res) => {
	const tops = ["Black", "White", "Orange", "Navy"];
	const jeans = ["Grey", "Dark Grey", "Black", "Navy"];
	const shoes = ["White", "Grey", "Black"];

	res.json({
		top: _.sample(tops),
		jeans: _.sample(jeans),
		shoes: _.sample(shoes)
	});
});

app.get("/comments/:id", async (req, res) => {
	const id = req.params.id;
	let content;

	try {
		content = await fs.readFile(`data/comments/${id}.txt`, "utf-8");
	} catch (err) {
		return res.sendStatus(404);
	}

	res.json({
		content: content
	});
});

app.post("/comments", async (req, res) => {
	const id = uuid();
	const content = req.body.content;

	if (!content) {
		return res.sendStatus(400);
	}

	await fs.mkdir("data/comments", { recursive: true });
	await fs.writeFile(`data/comments/${id}.txt`, content);

	res.status(201).json({
		id: id
	});
});

// New routes for coffee products
app.get("/products", async (req, res) => {
	try {
		const data = await fs.readFile("data/products.json", "utf-8");
		const products = JSON.parse(data);
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: "Failed to load products." });
	}
});

app.post("/products", async (req, res) => {
	const { image, title, description, price, ingredients } = req.body;
	const id = uuid();

	if (!image || !title || !description || !price || !ingredients) {
		return res.sendStatus(400); // Bad Request if any field is missing
	}

	const newProduct = { id, image, title, description, price, ingredients };

	try {
		await fs.mkdir("data", { recursive: true });
		let products = [];

		try {
			const data = await fs.readFile("data/products.json", "utf-8");
			products = JSON.parse(data);
		} catch (err) {
			// If the file doesn't exist, start with an empty array
		}

		products.push(newProduct);
		await fs.writeFile("data/products.json", JSON.stringify(products, null, 2)); // Write pretty JSON

		res.status(201).json(newProduct);
	} catch (err) {
		res.status(500).json({ error: "Failed to save product." });
	}
});

app.listen(3000, () => console.log("API Server is running..."));