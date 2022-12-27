const path = require('path');

module.exports = {
  entry: './dev/public/js/hcTextBox/TextBox.js',
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcTextBox.module.min.js',
  },  
};
