---
title: "Stream Files to Amazon S3"
date: "2015-04-20"
redirect_from:
  - /2015/04/20/nodejs-streaming-files-amazons3/
category: programming
---

For any SaaS platform it is common to use a 3rd party hosting service for uploading files and serving them through a CDN. Amazon S3 is a common choice.

Usually, the file upload from the client side (say, AngluarJS) is sent to the server (node server running on GNU/Linux box) which is then forwarded to Amazon S3. This approach is inefficient because the file needs to be opened and "read" by the server and then forwarded to S3. The solution provided here:

1. Extracts all the metadata (file name, size, mime type)
2. Opens a File stream to the Amazon S3 bucket
3. And writes the file directly to it.

### Code:

`gist:ketanbhatt/61ae289a9fb93ab040b4c063321797c3`

I struggled with it for quite some time when I needed to implement this feature in one of my projects. I hope it will help the community in the future.

### Resources:

1. [Multer](https://www.npmjs.com/package/multer)
2. [S3FS](https://github.com/RiptideCloud/s3fs)
