const path = require('path');

module.exports = {
  entry: './src/dashboard.js',
  output: {
    filename: 'dashboard.js',
    path: path.resolve(__dirname, 'public/javascripts'),
  },
};
