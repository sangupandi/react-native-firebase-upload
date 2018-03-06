const admin = require('firebase-admin');
const Busboy = require('busboy');
const contentType = require('content-type');
const cors = require('cors');
const express = require('express');
const rawBody = require('raw-body');

const app = express();

app.use(cors({ origin: true }));

app.use((req, res, next) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'].startsWith('multipart/form-data') &&
    req.rawBody === undefined
  ) {
    rawBody(
      req,
      {
        encoding: contentType.parse(req).parameters.charset,
        length: req.headers['content-length'],
        limit: '10mb'
      },
      (err, raw) => {
        if (err) return next(err);
        req.rawBody = raw;
        return next();
      }
    );
  } else next();
});

app.use((req, res, next) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    const busboy = new Busboy({ headers: req.headers });

    let buffer = Buffer.from('');

    req.files = { file: [] };

    busboy.on('file', (field, file, name, encoding, type) => {
      file.on('data', data => (buffer = Buffer.concat([buffer, data])));

      file.on('end', () => {
        req.files.file.push({ buffer, field, name, encoding, type });
        next();
      });
    });

    busboy.end(req.rawBody);
  } else next();
});

app.post('/', (req, res, next) => {
  const file = req.files.file[0];

  const upload = admin
    .storage()
    .bucket()
    .file(`${file.field}${file.name}`);

  const blob = upload.createWriteStream({
    metadata: { contentType: file.type }
  });

  blob.on('error', err => {
    res.status(500).json(err);
    next();
  });

  blob.on('finish', () => {
    res.status(200);
    next();
  });

  blob.end(file.buffer);
});

exports.handler = (req, res) => {
  if (!req.url) req.url = '/';
  return app(req, res);
};
