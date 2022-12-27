const path = require('path');

module.exports = {
  entry: './dev/public/js/hcTextBox/TextBox.js',
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'hcTextBox.min.js',
    library: 'hcTextBox', //add this line to enable re-use
  },
};
