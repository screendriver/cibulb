import test from 'tape';
import { isWebhookRequestBody } from '../../../api/color/body';

test('returns true when all properties are set', t => {
  t.plan(1);
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
  t.true(isWebhookRequestBody(body));
});

test('returns false when object_attributes.id property is missing', t => {
  t.plan(1);
  const body = {
    object_attributes: {
      ref: 'master',
      status: 'success',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  t.false(isWebhookRequestBody(body));
});

test('returns false when object_attributes.ref property is missing', t => {
  t.plan(1);
  const body = {
    object_attributes: {
      id: 123,
      status: 'success',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  t.false(isWebhookRequestBody(body));
});

test('returns false when object_attributes.status property is missing', t => {
  t.plan(1);
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
    },
    project: {
      path_with_namespace: 'my-project',
    },
  };
  t.false(isWebhookRequestBody(body));
});

test('returns false when project property is missing', t => {
  t.plan(1);
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
      status: 'success',
    },
  };
  t.false(isWebhookRequestBody(body));
});

test('returns false when project.path_with_namespace property is missing', t => {
  t.plan(1);
  const body = {
    object_attributes: {
      id: 123,
      ref: 'master',
      status: 'success',
    },
    project: {},
  };
  t.false(isWebhookRequestBody(body));
});

test('returns false when all properties are missing', t => {
  t.plan(1);
  const body = {};
  t.false(isWebhookRequestBody(body));
});
