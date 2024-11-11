import dotenv from 'dotenv';
import imap from 'imap';
import { simpleParser } from 'mailparser';
import xml2js from 'xml2js';
import axios from 'axios';

dotenv.config();

// MongoDB URL en database naam
const apiUrl = 'http://localhost:3000/api/invoices';  

class InvoiceFetcher {
    constructor(emailConfig) {
        this.emailConfig = emailConfig;

        // Instantiate IMAP en bind zijn methoden
        this.imap = new imap(emailConfig);
        this.imap.once('ready', this.onImapReady.bind(this));
        this.imap.once('error', this.onImapError.bind(this));
        this.imap.once('end', this.onImapEnd.bind(this));

        // Open IMAP connectie
        this.imap.connect();
    }

    onImapReady() {
        console.log('Connection established.');
        this.imap.openBox('INBOX', true, this.onOpenBox.bind(this));
    }

    onImapError(err) {
        console.error('IMAP error:', err);
        throw err;
    }

    onImapEnd() {
        console.log('Connection ended.');
    }

    onOpenBox(err) {
        if (err) {
            console.error('Error opening INBOX:', err);
            throw err;
        }

        console.log('INBOX opened successfully.');
        
        // Haal alleen ongelezen e-mails op
        this.imap.search(['UNSEEN'], this.onSearchResults.bind(this));
    }

    onSearchResults(searchErr, results) {
        if (searchErr) {
            console.error('Error searching for emails:', searchErr);
            throw searchErr;
        }

        console.log(`Fetched ${results.length} emails.`);

        // Verwerk elk gevonden bericht
        results.forEach((seqno) => {
            const fetch = this.imap.fetch([seqno], { bodies: '' });

            fetch.on('message', (msg, seqno) => {
                msg.on('body', (stream) => {
                    simpleParser(stream, (err, parsed) => {
                        if (err) {
                            console.error('Error parsing email:', err);
                            throw err;
                        }
                        if (parsed.attachments && parsed.attachments.length > 0) {
                            console.log(`Found attachments in Email ${seqno}`);
                            parsed.attachments.forEach((attachment, index) => {
                                if (this.isSupportedAttachment(attachment)) {
                                    console.log(`Parsing supported XML attachment: ${attachment.filename}`);
                                    this.parseXmlToJson(attachment.content);
                                } else {
                                    console.log(`Skipped unsupported attachment: ${attachment.filename}`);
                                }
                            });
                        } else {
                            console.log(`No attachments found in Email ${seqno}.`);
                        }
                    });
                });
            });
        });

        this.imap.end();
    }

    isSupportedAttachment(attachment) {
        const supportedExtensions = ['.xml'];

        if (attachment.filename) {
            const extension = attachment.filename.toLowerCase().split('.').pop();
            return supportedExtensions.includes(`.${extension}`);
        }
        return false;
    }

    // Parse XML naar JSON en stuur de gegevens naar je API
    async parseXmlToJson(xmlContent) {
        xml2js.parseString(xmlContent, async (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return;
            }

            // Stuur de geparseerde JSON naar je backend API
            try {
                console.log('Sending JSON to API...');
                const response = await axios.post(apiUrl, result);
                console.log('Data sent to API:', response.data);
            } catch (error) {
                console.error('Error sending data to API:', error);
            }
        });
    }
}

// Exporteer de klasse, zodat je deze in app.js kunt aanroepen
export default InvoiceFetcher;
