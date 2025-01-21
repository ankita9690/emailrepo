import React, { useState, useEffect } from 'react';

const EmailEditor = () => {
    const [layout, setLayout] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        header: '',
        content: '',
        footer: '',
        imageUrl: '', // For the first image
        imageUrll: '', // For the second image
    });
    const [imagePreview, setImagePreview] = useState(null); // Preview for the first image
    const [imagePreview2, setImagePreview2] = useState(null); // Preview for the second image
    const [downloadLink, setDownloadLink] = useState(null); // To hold the download link

    useEffect(() => {
        fetch('http://localhost:5000/getEmailLayout')
            .then((res) => res.text())
            .then(setLayout);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5000/uploadImage', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (imageType === 'imageUrl') {
            setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
            setImagePreview(URL.createObjectURL(file));
        } else if (imageType === 'imageUrll') {
            setFormData((prev) => ({ ...prev, imageUrll: data.imageUrl }));
            setImagePreview2(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        const response = await fetch('http://localhost:5000/uploadEmailConfig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Trigger download once the response is OK
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'output.html'; // Specify the filename for download
            link.click();
        } else {
            alert('Failed to save template.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1>Email Template Builder</h1>

            {/* First Image Upload */}
            <input type="file" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
            {imagePreview && <img src={imagePreview} alt="First Image Preview" style={{ maxWidth: '100%' }} />}

            <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
            />

            {/* Second Image Upload */}
            <input type="file" onChange={(e) => handleImageUpload(e, 'imageUrll')} />
            {imagePreview2 && <img src={imagePreview2} alt="Second Image Preview" style={{ maxWidth: '100%' }} />}

            <input
                type="text"
                name="header"
                placeholder="Header"
                value={formData.header}
                onChange={handleInputChange}
            />
            <textarea
                name="content"
                placeholder="Content"
                value={formData.content}
                onChange={handleInputChange}
            />
            <input
                type="text"
                name="footer"
                placeholder="Footer"
                value={formData.footer}
                onChange={handleInputChange}
            />
            <button onClick={handleSubmit}>Save and Download Template</button>
        </div>
    );
};

export default EmailEditor;
