import test from 'tape';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { github } from '../../src/index';

test('respond with HTTP 204', t => {
  t.plan(1);
  const send = sinon.stub();
  const req: Partial<Request> = {};
  const res: Partial<Response> = { send };
  github(req as Request, res as Response);
  t.true(send.calledWith(204));
});
