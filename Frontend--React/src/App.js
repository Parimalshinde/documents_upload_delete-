import React, { useEffect, useState } from 'react';
import UploadForm from './components/uploadForm';
import DocumentList from './components/DocumentList';
import api from './api';

function App() {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch documents' });
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSuccess = (doc) => {
    setMessage({ type: 'success', text: 'Uploaded successfully' });
    fetchDocs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setMessage({ type: 'success', text: 'Deleted successfully' });
      fetchDocs();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const handleDownload = (id) => {
    
    const url = `${api.defaults.baseURL}/documents/${id}`;

    window.open(url, '_blank');
  };

  return (
    <div className="container">
      <h1>Patient Document Portal</h1>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
          <button className="close" onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <UploadForm onSuccess={handleUploadSuccess} onError={(t)=>setMessage({type:'error', text:t})} />
      <hr />
      <DocumentList
        documents={documents}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default App;
