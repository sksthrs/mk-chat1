const path = require('path')
const outputPath = path.resolve(__dirname, 'dist')

const renderer = (env,argv) => ({
  mode: (argv.mode === 'production') ? 'production' : 'development',
  target: 'web',
  entry: path.join(__dirname, 'src', 'index'),
  output: {
    filename: 'mekiku.js',
    path: (argv.mode === 'production')
      ? outputPath
      : outputPath
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{
      test: /.ts?$/,
      use: [
        'ts-loader'
      ],
      include: [
        path.resolve(__dirname, 'src'),
      ],
    }]
  },
  devServer: {
    host: '0.0.0.0',
    port: 8088,
    contentBase: outputPath,
  }
});

module.exports = renderer

