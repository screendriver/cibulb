import SNS from 'aws-sdk/clients/sns';

export async function createTopic(topic: string) {
  const sns = new SNS({ endpoint: 'http://localhost:4575' });
  const topicResponse = await sns.createTopic({ Name: topic }).promise();
  return topicResponse.TopicArn ?? '';
}

export async function deleteTopic(topicArn: string) {
  const sns = new SNS({ endpoint: 'http://localhost:4575' });
  await sns.deleteTopic({ TopicArn: topicArn }).promise();
}
