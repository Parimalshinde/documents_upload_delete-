import React from 'react';

export default function DocumentList({ documents, onDelete, onDownload }) {
  if (!documents.length) {
    return <div>No documents uploaded yet.</div>;
  }

  return (
    <div className="doc-list">
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size (KB)</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id}>
              <td>{doc.filename}</td>
              <td>{Math.round(doc.filesize / 1024)}</td>
              <td>{new Date(doc.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => onDownload(doc.id)}>Download</button>
                <button onClick={() => onDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
