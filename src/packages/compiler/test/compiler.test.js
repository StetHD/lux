// @flow
import path from 'path';

import { getTestApp } from '../../../../test/utils/get-test-app';

describe('module "compiler"', () => {
  describe('#compile()', () => {
    const local = path.join(__dirname, '..', '..', '..', 'index.js');
    let dir;
    let rollup;
    let compile;

    beforeAll(async () => {
      rollup = jest.mock('rollup');
      ({ compile } = require('../index'));
      ({ path: dir } = await getTestApp());
    });

    afterAll(() => {
      jest.unmock('rollup');
    });

    describe('- with strict mode', () => {
      it('creates an instance of rollup with the correct config', async () => {
        await compile(dir, 'test', {
          local,
          useStrict: true,
        });

        expect(rollup.mock.calls).toMatchSnapshot();
      });
    });

    describe('- without strict mode', () => {
      it('creates an instance of rollup with the correct config', async () => {
        await compile(dir, 'test', {
          local,
          useStrict: false,
        });

        expect(rollup.mock.calls).toMatchSnapshot();
      });
    });
  });

  describe('#onwarn()', () => {
    const { warn } = console;
    let onwarn;

    beforeAll(() => {
      // $FlowIgnore
      console.warn = jest.fn();
      ({ onwarn } = require('../index'));
    });

    afterAll(() => {
      // $FlowIgnore
      console.warn = warn;
      jest.resetModules();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('outputs valid warning types to stderr', () => {
      onwarn({ code: 'EMPTY_BUNDLE', message: 'TEST' });

      expect(console.warn).toBeCalled();
      expect(console.warn.mock.calls).toMatchSnapshot();
    });

    it('ignores invalid warning types', () => {
      onwarn({ code: 'UNUSED_EXTERNAL_IMPORT', message: 'TEST' });

      expect(console.warn).not.toBeCalled();
    });
  });
});
