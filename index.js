const { error } = require("console");
const express = require("express");
const multer = require("multer");
const { nanoid } = require("nanoid");  // For generating unique IDs
const nodemailer = require("nodemailer");  // For sending emails
const path = require("path");
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
  })
  
const upload = multer({ storage: storage });

// Email transporter setup (replace with your email credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'guptasahil2175@gmail.com',
        pass: 'htcq pgct yhhh javm'
    }
});

app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use('/images', express.static(path.join(__dirname, "images"))); // Serve images from the "images" directory

// Handle file upload
app.post("/", upload.single("upload"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: "No file Uploaded."});
        }

        res.json({
            message: "File uploaded successfully.",
            file: req.file.filename,
            originalName: req.originalname,
            size: req.file.size,
            path: `uploads/${req.file.filename}`,
            type: req.file.mimetype,
        });
    }
    catch (err) {
        return res.status(500).json({error: "Server Error"})
    }
});

// Send email with file link
app.post("/send-email", async (req, res) => {
    try {
        const { emailTo, fileUrl } = req.body;
        
        const mailOptions = {
            from: 'your-email@gmail.com',
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
        res.status(500).json({ error: "Error sending email" });
    }
});

// Start the server
app.listen(8080, () => {
    console.log(`Server running on http://localhost:8080`);
});