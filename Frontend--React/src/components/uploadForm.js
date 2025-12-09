import React, { useState } from 'react';
import api from '../api';

export default function UploadForm({ onSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return onError('Please select a PDF file to upload');
    // client-side validation
    if (file.type !== 'application/pdf') return onError('Only PDF files are allowed');
    if (file.size > 10 * 1024 * 1024) return onError('File exceeds 10MB size limit');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess(res.data.document);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Upload failed';
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <label htmlFor="file-input">Upload PDF</label>
      <input id="file-input" type="file" accept="application/pdf" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
