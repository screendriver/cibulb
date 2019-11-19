import { expect } from 'chai';
import { isWebhookRequestBody } from '../../../api/color/body';

suite('body', function() {
  test('returns true when all properties are set', function() {
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
    expect(isWebhookRequestBody(body)).to.be.true;
    expect(isWebhookRequestBody(body)).to.be.true;
  });

  test('returns false when object_attributes.id property is missing', function() {
    const body = {
      object_attributes: {
        ref: 'master',
        status: 'success',
      },
      project: {
        path_with_namespace: 'my-project',
      },
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  test('returns false when object_attributes.ref property is missing', function() {
    const body = {
      object_attributes: {
        id: 123,
        status: 'success',
      },
      project: {
        path_with_namespace: 'my-project',
      },
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  test('returns false when object_attributes.status property is missing', function() {
    const body = {
      object_attributes: {
        id: 123,
        ref: 'master',
      },
      project: {
        path_with_namespace: 'my-project',
      },
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  test('returns false when project property is missing', function() {
    const body = {
      object_attributes: {
        id: 123,
        ref: 'master',
        status: 'success',
      },
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  test('returns false when project.path_with_namespace property is missing', function() {
    const body = {
      object_attributes: {
        id: 123,
        ref: 'master',
        status: 'success',
      },
      project: {},
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  test('returns false when all properties are missing', function() {
    const body = {};
    expect(isWebhookRequestBody(body)).to.be.false;
  });
});
