const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    color: './src/color.ts',
    ifttt: './src/ifttt.ts',
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
