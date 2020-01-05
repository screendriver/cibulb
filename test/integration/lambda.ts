import fs from 'fs';
import { promisify } from 'util';
import Lambda, { EnvironmentVariables } from 'aws-sdk/clients/lambda';
import JSZip from 'jszip';

const readFileAsync = promisify(fs.readFile);

function createLambdaService() {
  return new Lambda({ endpoint: 'http://localhost:4574' });
}

export async function createFunction(
  functionName: string,
  variables?: EnvironmentVariables,
) {
  const lambda = createLambdaService();
  const zip = new JSZip();
  zip.file(
    `${functionName}.js`,
    await readFileAsync(`./target/lambda/${functionName}.js`),
  );
  return lambda
    .createFunction({
      Code: {
        ZipFile: await zip.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE',
        }),
      },
      FunctionName: functionName,
      Role: 'arn:aws:iam:123/default',
      Handler: `${functionName}.handler`,
      Runtime: 'nodejs12.x',
      Environment: {
        Variables: variables,
      },
    })
    .promise();
}

export async function deleteFunction(functionName: string) {
  const lambda = createLambdaService();
  await lambda.deleteFunction({ FunctionName: functionName }).promise();
}
