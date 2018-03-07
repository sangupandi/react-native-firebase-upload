const helper = ({ uri, name, endpoint, path = '/', storage, token }) =>
  new Promise(async (res, rej) => {
    try {
      const body = new FormData();

      body.append(path, { uri, name });

      const upload = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!upload.ok) {
        const err = await upload.json();

        rej(new Error(err));
      }

      const metadata = await storage.ref(`${path}${name}`).getMetadata();

      res(metadata);
    } catch (err) {
      rej(err);
    }
  });

export default helper;
