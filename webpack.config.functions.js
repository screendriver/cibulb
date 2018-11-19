const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'node',
  entry: {
    github: './src/functions/github.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'functions'),
    filename: '[name].js',
    libraryTarget: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'src/functions/tsconfig.json',
            },
          },
        ],
      },
    ],
  },
};
