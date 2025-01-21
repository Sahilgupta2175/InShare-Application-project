const { error } = require("console");
const express = require("express");
const multer = require("multer");
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
  
const upload = multer({ storage: storage })

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

// Start the server
app.listen(8080, () => {
    console.log(`Server running on http://localhost:8080`);
});