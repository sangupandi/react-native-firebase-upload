# react-native-firebase-upload

This package allows you to upload assets from React Native to Firebase Cloud Storage through a Firebase Cloud Function.

# Installation

`yarn add react-native-firebase-upload express busboy raw-body` in your functions dir.

`yarn add react-native-firebase-upload` in your React Native project.

# Usage

**Firebase Cloud Function**

```javascript
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const upload = require('react-native-firebase-upload');

admin.initializeApp(functions.config().firebase);

exports.upload = functions.https.onRequest(upload.handler);

// with authentication
exports.upload = functions.https.onRequest(upload.authHandler);
```

**React Native**

```javascript
import upload from 'react-native-firebase-upload';
import { auth, initializeApp, storage } from 'firebase';

initializeApp(/* .. */);

const pick = async () => {
  try {
    // we are using Expo here
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync();

    if (!cancelled) {
      let name = uri.split('/');
      name = name[name.length - 1];

      const token = await auth().currentUser.getIdToken(true); // true = forceRefresh

      const metadata = await upload({
        uri,
        name,
        endpoint: 'FUNCTION_ENDPOINT',
        storage: storage(),

        path: 'img/', // will store in `img` folder, defaults to root directory `/`
        token // pass the token if your endpoint requires authentication
      });

      console.log({
        downloadURL: metadata.downloadURLs[0],
        storageLocation: `gs://${metadata.bucket}/${metadata.fullPath}`
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};
```
