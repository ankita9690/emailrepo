const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup for CORS and parsing JSON
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the React app for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


// Layout Template Path
const layoutPath = path.join(__dirname, 'layout.html');

// API to fetch the email layout HTML
app.get('/getEmailLayout', (req, res) => {
    const layout = fs.readFileSync(layoutPath, 'utf8');
    res.send(layout);
});

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// API to upload an image
app.post('/uploadImage', upload.single('image'), (req, res) => {
    // const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const imageUrl = `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;

    res.json({ success: true, imageUrl });
});

// API to save email template configuration
app.post('/uploadEmailConfig', (req, res) => {
    const { title, header, content, footer, imageUrl, imageUrll } = req.body;

    // Read the CSS file content
    const cssContent = fs.readFileSync(path.join(__dirname, 'output.css'), 'utf8');

    // Create the email template using the provided data
    const outputHtml = fs.readFileSync(layoutPath, 'utf8')
        .replace('{{title}}', title)
        .replace('{{header}}', header)
        .replace('{{content}}', content)
        .replace('{{footer}}', footer)
        .replace('{{imageUrl}}', imageUrl)
        .replace('{{imageUrll}}', imageUrll);

    // Embed the CSS into the HTML
    const htmlWithCss = outputHtml.replace(
        '<head>',
        `<head>
            <style>
                ${cssContent}
            </style>`
    );

    // Save the generated template to output.html
    const outputPath = path.join(__dirname, 'output.html');
    fs.writeFileSync(outputPath, htmlWithCss);

    // Send the generated file as the response for download
    res.download(outputPath, 'output.html', (err) => {
        if (err) {
            console.log("Error during file download: ", err);
            res.status(500).send("Error during download.");
        }
    });
});




// API to download the rendered email template
app.get('/renderAndDownloadTemplate', (req, res) => {
    const outputPath = path.join(__dirname, 'output.html');
    res.download(outputPath);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


