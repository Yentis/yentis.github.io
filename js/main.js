'use strict';

var GitHub = require('./github');
var config = {
   username: 'Yentis',
   password: '815af6fb3db476c70db8a9d97132aadc0999355c', // Either your password or an authentication token if two-factor authentication is enabled
   auth: 'basic',
   repository: 'yentis.github.io',
   branchName: 'master'
};
var gitHub = new GitHub(config);
var emoteNumber;
var emoteName;

/**
 * Reads the content of the file provided. Returns a promise whose resolved value is an object literal containing the
 * name (<code>filename</code> property) and the content (<code>content</code> property) of the file.
 *
 * @param {File} file The file to read
 *
 * @returns {Promise}
 */
function readFile(file) {
   return new Promise(function (resolve, reject) {
      var fileReader = new FileReader();

      fileReader.addEventListener('load', function (event) {
         var content = event.target.result;
         var extension = '.' + file.name.split('.')[1];

         // Strip out the information about the mime type of the file and the encoding
         // at the beginning of the file (e.g. data:image/gif;base64,).
         content = atob(content.replace(/^(.+,)/, ''));


         gitHub.repository.getContents('master', 'emotes/emotes.json', false, function (result1, result2) {
            var oldJson = atob(result2.content);
            var jsonObj = JSON.parse(oldJson);
            jsonObj[emoteNumber] = emoteName + extension;

            var newJson = JSON.stringify(jsonObj);

            resolve({
               filename: 'emotes/images/' + emoteNumber + extension,
               content: btoa(content),
               newJson: newJson
            });
         });
      });

      fileReader.addEventListener('error', function (error) {
         reject(error);
      });

      fileReader.readAsDataURL(file);
   });
}

/**
 * Save the files provided on the repository with the commit title specified. Each file will be saved with
 * a different commit.
 *
 * @param {FileList} files The files to save
 * @param {string} commitTitle The commit title
 *
 * @returns {Promise}
 */
function uploadFiles(files, commitTitle) {
   // Creates an array of Promises resolved when the content
   // of the file provided is read successfully.
   var filesPromises = [].map.call(files, readFile);

   return Promise
      .all(filesPromises)
      .then(function(files) {
         return files.reduce(
            function(promise, file) {
               return promise.then(function() {
                  // Upload the file on GitHub
                  return gitHub.saveFile({
                     repository: gitHub.repository,
                     branchName: config.branchName,
                     filename: file.filename,
                     content: file.content,
                     commitTitle: commitTitle,
                     options: {encode: false}
                  }).then(function () {
                     return gitHub.saveFile({
                        repository: gitHub.repository,
                        branchName: config.branchName,
                        filename: 'emotes/emotes.json',
                        content: file.newJson,
                        commitTitle: 'Update JSON',
                        options: {encode: true}
                     });
                  });
               });
            },
            Promise.resolve()
         );
      });
}

document.querySelector('form').addEventListener('submit', function (event) {
   event.preventDefault();

   gitHub.repository.getContents('master', 'emotes/images', false, function (result1, result2) {
      emoteNumber = result2.length + 1;
      emoteName = document.getElementById('emotename').value;
      var files = document.getElementById('file').files;
      var commitTitle = 'Adding new emote';

      uploadFiles(files, commitTitle)
          .then(function() {
             document.getElementById('message').innerHTML = 'Your file has been saved correctly. \n Restart Discord with CTRL + R or go <a href="https://yentis.github.io/emotes">here</a> to see your new emote.';
          })
          .catch(function(err) {
             console.error(err);
             document.getElementById('message').innerHTML = 'Something went wrong. Please, try again.';
          });
   });
});