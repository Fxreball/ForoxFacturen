import dotenv from "dotenv";
dotenv.config();
import express from "express"; 
import cors from "cors";

// Importeer de MailAttachmentFetcher uit InvoiceFetcher.js
import InvoiceFetcher from './InvoiceFetcher.js'; // Zorg ervoor dat de extensie .js wordt toegevoegd

const app = express();

app.use(cors());

// Server status
app.get("/", (req, res) => {
    res.send("Server is ready.");
});

// API route om e-mailbijlagen op te halen
app.get("/api/fetch-invoices", (req, res) => {
    // Maak de emailConfig object op basis van je .env variabelen
    const emailConfig = {
        user: process.env.EMAIL,
        password: process.env.PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true
    };

    // Maak de fetcher aan en start het proces
    const fetcher = new InvoiceFetcher(emailConfig, './invoices');
    
    // Feedback sturen over het ophalen van de bijlagen
    res.status(200).send({ message: 'Facturen worden opgehaald. Bekijk console log voor verdere details' });
});

// Hier moet de connectie met VISTA gerealiseerd worden
//
//
//
//

// Start de server
const PORT = process.env.PORT || 3000; // Fallback poort als de omgevingsvariabele niet gedefinieerd is
app.listen(PORT, () => {
    console.log(`Server is ready op http://localhost:${PORT}`);
});
