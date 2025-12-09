const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
}).single('file');




app.get('/', (req, res) => res.json({ status: 'ok' }));


app.post('/documents/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      // Multer errors or custom errors
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { filename, path: filepath, size } = req.file;
    const relativePath = path.relative(__dirname, filepath);

    
    db.run(
      `INSERT INTO documents (filename, filepath, filesize) VALUES (?, ?, ?)`,
      [filename, relativePath, size],
      function (dbErr) {
        if (dbErr) {
          
          fs.unlink(filepath, () => {});
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        const insertedId = this.lastID;
        db.get(`SELECT id, filename, filesize, created_at FROM documents WHERE id = ?`, [insertedId], (e, row) => {
          if (e) return res.status(500).json({ success: false, message: 'DB read error' });
          res.status(201).json({ success: true, message: 'File uploaded', document: row });
        });
      }
    );
  });
});


app.get('/documents', (req, res) => {
  db.all(`SELECT id, filename, filesize, created_at FROM documents ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json(rows);
  });
});


app.get('/documents/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT id, filename, filepath FROM documents WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });

    const absolutePath = path.join(__dirname, row.filepath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(410).json({ success: false, message: 'File missing on server' });
    }
    
    res.download(absolutePath, row.filename, (downloadErr) => {
      if (downloadErr) {
        console.error('Download error', downloadErr);
      }
    });
  });
});


app.delete('/documents/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT filepath FROM documents WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (!row) return res.status(404).json({ success: false, message: 'Document not found' });

    const absolutePath = path.join(__dirname, row.filepath);
    
    fs.unlink(absolutePath, (fsErr) => {

      db.run(`DELETE FROM documents WHERE id = ?`, [id], function (dbErr) {
        if (dbErr) return res.status(500).json({ success: false, message: 'DB delete error' });
        res.json({ success: true, message: 'Document deleted' });
      });
    });
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
