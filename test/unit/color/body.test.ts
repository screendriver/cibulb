import { expect } from 'chai';
import { isWebhookRequestBody } from '../../../api/color/body';

describe('body', () => {
  it('returns true when all properties are set', () => {
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

  it('returns false when object_attributes.id property is missing', () => {
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

  it('returns false when object_attributes.ref property is missing', () => {
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

  it('returns false when object_attributes.status property is missing', () => {
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

  it('returns false when project property is missing', () => {
    const body = {
      object_attributes: {
        id: 123,
        ref: 'master',
        status: 'success',
      },
    };
    expect(isWebhookRequestBody(body)).to.be.false;
  });

  it('returns false when project.path_with_namespace property is missing', () => {
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

  it('returns false when all properties are missing', () => {
    const body = {};
    expect(isWebhookRequestBody(body)).to.be.false;
  });
});
