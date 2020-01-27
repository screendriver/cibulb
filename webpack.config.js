const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    color: './src/lambda/color.ts',
    ifttt: './src/lambda/ifttt.ts',
    refresh: './src/lambda/refresh.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'target/lambda/'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  externals: /^aws-sdk?./,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true,
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
};
