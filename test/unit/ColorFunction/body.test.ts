import test from 'tape';
import { isWebhookJsonBody } from '../../../ColorFunction/body';

test('returns true when all properties are set', t => {
  t.plan(1);
  const body = {
    id: 123,
    name: 'test',
    state: 'success',
    branches: [],
  };
  t.true(isWebhookJsonBody(body));
});

test('returns false when id property is missing', t => {
  t.plan(1);
  const body = {
    name: 'test',
    state: 'success',
    branches: [],
  };
  t.false(isWebhookJsonBody(body));
});

test('returns false when name property is missing', t => {
  t.plan(1);
  const body = {
    id: 123,
    state: 'success',
    branches: [],
  };
  t.false(isWebhookJsonBody(body));
});

test('returns false when state property is missing', t => {
  t.plan(1);
  const body = {
    id: 123,
    name: 'test',
    branches: [],
  };
  t.false(isWebhookJsonBody(body));
});

test('returns false when branches property is missing', t => {
  t.plan(1);
  const body = {
    id: 123,
    name: 'test',
    state: 'success',
  };
  t.false(isWebhookJsonBody(body));
});

test('returns false when all properties are missing', t => {
  t.plan(1);
  const body = {};
  t.false(isWebhookJsonBody(body));
});
