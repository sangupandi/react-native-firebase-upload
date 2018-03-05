const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const contentType = require('content-type');
const cors = require('cors');
const express = require('express');
const getRawBody = require('raw-body');

const app = express().use(cors({ origin: true }));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (
    req.rawBody === undefined &&
    req.method.toLowerCase() === 'post' &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    getRawBody(
      req,
      {
        length: req.headers['content-length'],
        limit: '10mb',
        encoding: contentType.parse(req).parameters.charset
      },
      (err, string) => {
        if (err) return next(err);
        req.rawBody = string;
        next();
      }
    );
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (
    req.method.toLowerCase() === 'post' &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    const busboy = new Busboy({ headers: req.headers });

    let fileBuffer = new Buffer('');

    req.files = { file: [] };

    busboy.on('file', (fieldname, file, name, encoding, mimetype) => {
      file.on('data', data => (fileBuffer = Buffer.concat([fileBuffer, data])));

      file.on('end', () => {
        const fileObject = {
          buffer: fileBuffer,
          encoding,
          fieldname,
          mimetype,
          name
        };

        req.files.file.push(fileObject);

        next();
      });
    });

    busboy.end(req.rawBody);
  } else next();
});

app.post('/', (req, res, next) => {
  const file = req.files.file[0];

  const storage = admin.storage();

  const upload = storage
    .bucket()
    .file(`${req.files.file[0].fieldname}${file.name}`);

  const blob = upload.createWriteStream({
    metadata: { contentType: file.mimetype }
  });

  blob.on('error', err => {
    res.status(500).json(err);
    next();
  });

  blob.on('finish', () => {
    upload
      .getMetadata()
      .then(metadata => {
        res.status(200).json(metadata[0]);
        next();
      })
      .catch(err => {
        res.status(500).json(err);
        next();
      });
  });

  blob.end(file.buffer);
});

exports.handler = app;
