require('dotenv').config();
const fs = require("fs");
const imap = require('imap');
const simpleParser = require('mailparser').simpleParser;

const invoicesDb = './invoices';

class MailAttachmentFetcher {
    constructor(emailConfig, invoicesDb) {
        this.emailConfig = emailConfig;
        this.invoicesDb = invoicesDb;

        // Kijk of de map bestaat en creeër de map als deze niet bestaat
        if (!fs.existsSync(invoicesDb)) {
            fs.mkdirSync(invoicesDb);
        }

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
                            console.log(`\nSaving attachments from Email ${seqno}`);
                            parsed.attachments.forEach((attachment, index) => {
                                if (this.isSupportedAttachment(attachment)) {
                                    const filename = attachment.filename || `attachment_${seqno}_${index + 1}.${attachment.contentType.split('/')[1]}`;
                                    const filePath = `${this.invoicesDb}/${filename}`;

                                    // Controleer of het bestand al is geïmporteerd
                                    if (fs.existsSync(filePath)) {
                                        console.log(`Skipped already saved file: ${filePath}`);
                                    } else {
                                        fs.writeFileSync(filePath, attachment.content);
                                        console.log(`Saved supported attachment: ${filePath}`);
                                    }
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
}

// Exporteer de klasse, zodat je deze in app.js kunt aanroepen
module.exports = MailAttachmentFetcher;
