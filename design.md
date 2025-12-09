
 design for patient documents portal

 tech stack choices

1.frontend framework

 react js
 why
 popular for single page apps
 lots of components and ecosystem
 easy to hook with rest api

2.backend framework

 express js on node js
 why
 minimal and fast for simple apis
 wide middleware support for file uploads

3.database

 sqlite for local development
 why
 simple file based db easy to setup
 less ops for small scale

4.considerations for 1000 users

move sqlite to postgres or managed db
  use cloud storage for files like s3 instead of local uploads folder
  add authentication and per user isolation of files
  add load balancer and multiple backend instances behind it
  use nginx for static file serving and caching
  add background jobs for heavy processing like pdf parsing

5. architecture overview

user browser frontend react app
frontend calls backend rest api express
backend receives file and saves to uploads folder
backend writes metadata to sqlite database
frontend lists files by calling get documents api
download route streams file from uploads folder to client

6. api specification

a.upload file

 url
 /documents/upload
 method
 post
 sample request
 form data with key file type application pdf
 sample response
 { "id": 1, "filename": "prescription.pdf", "filesize": 123456, "created_at": "2025-12-09T18:30:00" }
 description
 uploads a pdf saves file to uploads and metadata to db

b.list documents

 url
 /documents
 method
 get
 sample request
 none
 sample response
 [ { "id": 1, "filename": "prescription.pdf", "filesize": 123456, "created_at": "2025-12-09T18:30:00" } ]
 description
 returns metadata for all uploaded files

c.download file

 url
 /documents/:id
 method
 get
 sample request
 none
 sample response
 binary stream of the file with correct content type application pdf
 description
 streams the requested file to client

d.delete file

 url
 /documents/:id
 method
 delete
 sample request
 none
 sample response
 { "success": true, "id": 1 }
 description
 removes file from uploads and deletes metadata row from db

7.data flow description

upload flow

user picks pdf from browser
 frontend validates file type and size on client side
 frontend sends multipart form data to post /documents/upload
 backend validates file type again and saves file in uploads folder with unique filename
 backend inserts metadata into documents table in sqlite
 backend returns metadata id to frontend

8.download flow

 user clicks download in frontend
 frontend calls get /documents/:id
 backend looks up filepath in db
 backend sends file as stream with content type application pdf
 browser saves or opens the file

 database schema

9.table documents

 id integer primary key autoincrement
 filename text original filename
 filepath text path inside uploads folder
 filesize integer bytes
 created_at text iso timestamp

10.assumptions

single user only no auth for simplicity
max file size 10mb enforced on client and server
only pdf files accepted by content type and extension
concurrent uploads low for local dev
backups not required for local assignment

 
