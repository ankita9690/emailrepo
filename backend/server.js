const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Setup for CORS and parsing JSON
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

// API to save email template configuration
app.post('/uploadEmailConfig', (req, res) => {
    // console.log(req.body);
    const { title, header, content, footer, imageUrl, imageUrll } = req.body;
    const outputHtml = fs.readFileSync(layoutPath, 'utf8')
        .replace('{{title}}', title)
        .replace('{{header}}', header)
        .replace('{{content}}', content)
        .replace('{{footer}}', footer)
        .replace('{{imageUrl}}', imageUrl)
        .replace('{{imageUrll}}', imageUrll);

    fs.writeFileSync('output.html', outputHtml);  // Saving the template
    res.json({ success: true, message: 'Template saved successfully.' });
});

// API to download the rendered email template
app.get('/renderAndDownloadTemplate', (req, res) => {
    const outputPath = path.join(__dirname, 'output.html');
    res.download(outputPath);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


