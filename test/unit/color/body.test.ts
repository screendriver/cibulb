import { isWebhookRequestBody } from '../../../api/color/body';

test('returns true when all properties are set', () => {
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
      status: 'success',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  expect(isWebhookRequestBody(body)).toBe(true);
});

test('returns false when object_attributes.id property is missing', () => {
  const body = {
    object_attributes: {
      ref: 'master',
      status: 'success',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  expect(isWebhookRequestBody(body)).toBe(false);
});

test('returns false when object_attributes.ref property is missing', () => {
  const body = {
    object_attributes: {
      id: 123,
      status: 'success',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  expect(isWebhookRequestBody(body)).toBe(false);
});

test('returns false when object_attributes.status property is missing', () => {
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  expect(isWebhookRequestBody(body)).toBe(false);
});

test('returns false when project property is missing', () => {
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
      status: 'success',
    },
  };
  expect(isWebhookRequestBody(body)).toBe(false);
});

test('returns false when project.path_with_namespace property is missing', () => {
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
      status: 'success',
    },
    project: {},
  };
  expect(isWebhookRequestBody(body)).toBe(false);
});

test('returns false when all properties are missing', () => {
  const body = {};
  expect(isWebhookRequestBody(body)).toBe(false);
});
