const admin = require('firebase-admin');
const Busboy = require('busboy');
const express = require('express');
const rawBody = require('raw-body');

const app = express();

// `req.rawBody` is already provided by the cloud engine
// to test locally we need to add this middleware to emulate that behavior
app.use(
  (req, res, next) =>
    !req.rawBody &&
    rawBody(
      req,
      { length: req.headers['content-length'], limit: '10mb' },
      (err, raw) => {
        if (err) return next(err);
        req.rawBody = raw;
        return next();
      }
    )
);

app.use((req, res, next) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', (field, file, name, encoding, contentType) => {
    let buffer = Buffer.from('');

    file.on('data', data => (buffer = Buffer.concat([buffer, data])));

    file.on('end', () => {
      req.file = { buffer, field, name, contentType };
      next();
    });
  });

  busboy.end(req.rawBody);
});

app.post('/', (req, res) => {
  const { buffer, field, name, contentType } = req.file;

  const file = admin
    .storage()
    .bucket()
    .file(`${field}${name}`);

  const upload = file.createWriteStream({ metadata: { contentType } });

  upload.on('error', err => res.status(500).json(err));

  upload.on('finish', () => res.status(200).end());

  upload.end(buffer);
});

exports.handler = (req, res) => {
  if (
    req.method !== 'POST' ||
    !req.headers['content-type'].startsWith('multipart/form-data')
  )
    return res.status(500).end();

  if (!req.url) req.url = '/';

  return app(req, res);
};
