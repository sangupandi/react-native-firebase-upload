# react-native-firebase-upload

This package allows you to upload assets from React Native to Firebase Cloud Storage through a Firebase Cloud Function, it is adapted from [this post](https://medium.com/@wcandillon/uploading-images-to-firebase-with-expo-a913c9f8e98d).

**This package will be depreciated once blob is fully supported in React Native (coming very soon, PRs have already been merged).**

# Installation

in your functions dir.

`yarn add react-native-firebase-upload`

`yarn add busboy express raw-body`

in your React Native project.

`yarn add react-native-firebase-upload`

# Usage

**Firebase Cloud Function**

```javascript
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const upload = require('react-native-firebase-upload');

admin.initializeApp(functions.config().firebase);

exports.upload = functions.https.onRequest(upload.handler);
```

**React Native**

```javascript
import upload from 'react-native-firebase-upload';

const pick = async () => {
  try {
    // we are using Expo here
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync();

    if (!cancelled) {
      let name = uri.split('/');
      name = name[name.length - 1];

      const metadata = await upload({
        uri,
        name,
        endpoint: 'FUNCTION_ENDPOINT',
        storage, // your firebase.storage() ref.

        path: 'img/' // will store in `img` folder, defaults to root directory `/`
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
