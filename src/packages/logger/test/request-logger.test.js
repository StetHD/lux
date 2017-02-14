// @flow
import EventEmitter from 'events';

import { FORMATS } from '../constants';
import { createRequestLogger } from '../request-logger';
import { getTestApp } from '../../../../test/utils/get-test-app';
import {
  createResponse,
  createRequestBuilder
} from '../../../../test/utils/mocks';

import Logger from '../index';

const {
  stdout: {
    write: writeOut,
  },
  stderr: {
    write: writeErr,
  },
} = process;

describe('module "logger/request-logger"', () => {
  describe('#createRequestLogger()', () => {
    beforeAll(() => {
      global.process.stdout.write = jest.fn();
      global.process.stderr.write = jest.fn();
    });

    afterAll(() => {
      global.process.stdout.write = writeOut;
      global.process.stderr.write = writeErr;
    });

    FORMATS.forEach(format => {
      describe(`- format "${format}"`, () => {
        let subject;

        beforeAll(() => {
          const logger = new Logger({
            format,
            level: 'INFO',
            enabled: true,
            filter: {
              params: []
            }
          });

          subject = createRequestLogger(logger);
        });

        it('returns a request logger function', () => {
          expect(typeof subject).toBe('function');
          expect(subject).toHaveLength(3);
        });

        describe('- logger function', () => {
          let req;
          let res;

          beforeAll(async () => {
            const { router } = await getTestApp();
            const emitter = new EventEmitter();
            const createRequest = createRequestBuilder({
              path: '/',
              route: router.get('GET:/posts'),
              params: {}
            });

            req = createRequest();
            res = Object.assign(createResponse(), {
              on: (...args) => emitter.on(...args),
              once: (...args) => emitter.once(...args),
              emit: (...args) => emitter.emit(...args),
              removeListener: (...args) => emitter.removeListener(...args),
              removeAllListeners: (...args) => (
                emitter.removeAllListeners(...args)
              )
            });
          });

          it('does not throw an error', async () => {
            expect(() => {
              subject(req, res, {
                startTime: Date.now()
              });
            }).not.toThrow();
            res.emit('finish');
          });
        });
      });
    });
  });
});
