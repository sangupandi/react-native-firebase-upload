# react-native-firebase-upload

This package allows you to upload assets from React Native to Firebase Cloud Storage through a Firebase Cloud Function, it is adapted from [this post](https://medium.com/@wcandillon/uploading-images-to-firebase-with-expo-a913c9f8e98d). Right now it is just a direct implementation, more enhancements might be coming.

**This package will be depreciated once blob is fully supported in React Native (coming very soon, PRs have already been merged).**

# Installation

`yarn add react-native-firebase-upload`

`yarn add body-parser busboy content-type cors express raw-body`

in your functions dir.

`yarn add react-native-firebase-upload`

in your React Native project.

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

      const res = await upload({
        uri,
        name,
        endpoint: 'FUNCTION_ENDPOINT',
        path: 'img/', // will store in `img` folder, defaults to root directory `/`
        storage // your firebase.storage() ref.
      });

      // returns upload metadata
      console.log({
        downloadURL: res.downloadURLs[0],
        storageLocation: `gs://${res.bucket}/${res.fullPath}`
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};
```
