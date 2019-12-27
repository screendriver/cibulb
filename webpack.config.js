const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    color: './src/color.ts',
    refresh: './src/refresh.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'target/lambda/'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
};
