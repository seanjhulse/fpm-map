module.exports = {
  entry: './src/app.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: './public',
    proxy: {
      '/webservice/**': {
        target: 'https://staging.www.wisc.edu/',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  node: {
    fs: "empty",
  },
};