import { it, expect, beforeEach } from 'bun:test'
import { makePipeline } from 'core'
import { createReusableBlocksPlugin } from '..'

let engine: (input: string) => string;

beforeEach(
  () => engine = makePipeline([...createReusableBlocksPlugin()])
);

it('should throw an error when encountering a reusable block with more than one selector',
  () =>
  {
    const input = 'reusable test, div {}';

    expect(() => engine(input)).toThrowError(
      'A reusable block cannot have more than one selector'
    );
  }
);

it('should throw an error when encountering a reusable block with children',
  () =>
  {
    const input = 'reusable test {span {}}';

    expect(() => engine(input)).toThrowError('A reusable block cannot have children');
  }
);

it('should throw an error when a reusable block name is not unique',
  () =>
  {
    const input = 'reusable `test` {} reusable `test` {}';

    expect(() => engine(input)).toThrowError('Non-unique reusable block name (test)');
  }
);

it('should throw an error when encountering an unknown reusable block name',
  () =>
  {
    const input = 'span { !include: test; }';

    expect(() => engine(input)).toThrowError('Unknown reusable block (test)');
  }
);