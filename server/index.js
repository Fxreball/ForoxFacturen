import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import InvoiceFetcher from './InvoiceFetcher.js';

dotenv.config();

const app = express();

// Stel CORS-opties in om alleen specifieke domeinen toe te staan
const corsOptions = {
  origin: ["http://dev.owencoenraad.nl", "http://api.owencoenraad.nl", "localhost"], // Voeg hier de toegestane domeinen toe
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const databaseName = "cluster0";
const collectionName = "invoices";

async function dbConnection() {
    try {
        await client.connect();
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error("Failed to connect to MongoDB.", err);
    }
}

// Server status
app.get("/", (req, res) => {
    res.send("Server is ready.");
});

// GET route om alle facturen op te halen
app.get("/api/invoices", async (req, res) => {
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const invoices = await collection.find().toArray();
        res.status(200).send(invoices);
    } catch (err) {
        console.error("Error fetching invoices: ", err);
        res.status(500).send({ message: "Failed to retrieve invoices" });
    }
});

// Factuur opslaan in de database
app.post("/api/invoices", async (req, res) => {
    console.log(req.body);
    const invoiceData = req.body;
    const invoiceNumber = invoiceData.invoiceNumber;

    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const existingInvoice = await collection.findOne({ invoiceNumber: invoiceNumber });

        if (existingInvoice) {
            console.log(`Invoice number ${invoiceNumber} already exists.`);
            return res.status(400).send({ message: 'Invoice already exists with this number.' });
        }

        const result = await collection.insertOne(invoiceData);
        console.log('Invoice saved to MongoDB:', result);
        res.status(200).send({ message: 'Invoice saved successfully', data: result });
    } catch (err) {
        console.error('Error saving invoice to MongoDB:', err);
        res.status(500).send({ message: 'Error saving invoice data', error: err.message });
    }
});

// API route om e-mailbijlagen op te halen
app.get("/api/fetch-invoices", (req, res) => {
    const emailConfig = {
        user: process.env.EMAIL,
        password: process.env.PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true,
    };

    const fetcher = new InvoiceFetcher(emailConfig, './invoices');
    res.status(200).send({ message: 'Facturen worden opgehaald. Bekijk console log voor verdere details' });
});

async function serverStart() {
    await dbConnection();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is ready op http://0.0.0.0:${PORT}`);
    });
}

serverStart();
