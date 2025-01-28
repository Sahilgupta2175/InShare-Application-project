// index.js

const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
require('dotenv').config();

const app = express();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
  
const upload = multer({ storage: storage });

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.use(express.json());

// Handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: "No file uploaded."});
        }

        const fileId = crypto.randomBytes(16).toString('hex');
        const fileUrl = `${req.protocol}://${req.get('host')}/file/${fileId}`;

        // In a production app, save this information to a database
        const fileInfo = {
            id: fileId,
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: fileUrl
        };

        res.json({
            message: "File uploaded successfully.",
            fileUrl: fileUrl,
            ...fileInfo
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Server Error"})
    }
});

// Serve the file when accessed via the unique URL
app.get("/file/:id", (req, res) => {
    const fileId = req.params.id;
    // In a real application, retrieve file info from database using fileId
    // For this example, we'll just serve a dummy file
    res.sendFile(path.join(__dirname, 'uploads', 'dummy-file.txt'));
});

// Send email with file link
app.post("/send-email", async (req, res) => {
    try {
        const { emailTo, fileUrl } = req.body;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailTo,
            subject: 'File Shared with You',
            html: `
                <h2>Someone has shared a file with you</h2>
                <p>Click the link below to download:</p>
                <a href="${fileUrl}">${fileUrl}</a>
                <p>Link expires in 24 hours</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Email sent successfully" });
    }
    catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email" });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});