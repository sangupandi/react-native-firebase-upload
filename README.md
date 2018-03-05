# react-native-firebase-upload

This package allows you to upload assets from React Native to Firebase Cloud Storage through a Firebase Cloud Function, it is adapted from [this post](https://medium.com/@wcandillon/uploading-images-to-firebase-with-expo-a913c9f8e98d). Right now it is just a direct implementation, more enhancements might be coming.

**This package will be depreciated once blob support is fully supported in React Native (coming very soon, PRs have already been merged).**

# Installation

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
upload = async () => {
  try {
    // we are using Expo here
    const file = await ImagePicker.launchImageLibraryAsync();

    if (!file.cancelled) {
      const body = new FormData();

      let name = file.uri.split('/');
      name = name[name.length - 1];

      // this uploads to the root dir in the bucket
      body.append('/', { uri: file.uri, name });

      // this uploads to the sub dir in the bucket
      // body.append('img/', { uri: file.uri, name });

      await fetch('FUNCTION_ENDPOINT', {
        method: 'post',
        body,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      const url = await storage()
        .ref() // .ref('img') if using a sub dir
        .child(name)
        .getDownloadURL();

      console.log(url);
    }
  } catch (err) {
    console.log(err.message);
  }
};
```
