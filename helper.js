const helper = ({ uri, name, endpoint, path = '/', storage }) =>
  new Promise(async (res, rej) => {
    try {
      const body = new FormData();

      body.append(path, { uri, name });

      await fetch(endpoint, {
        method: 'post',
        body,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      const metadata = await storage.ref(`${path}${name}`).getMetadata();

      res(metadata);
    } catch (err) {
      rej(err);
    }
  });

export default helper;
