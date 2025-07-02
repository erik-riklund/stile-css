import { it, expect } from 'bun:test'
import { createTreeFromString } from '..'


it('should parse an empty block',
  () =>
  {
    const input = 'div{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['div']);
  }
);

it('should parse a block with properties',
  () =>
  {
    const input = 'div{color:red;}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['div']);
    expect(tree[0].properties).toEqual([{ key: 'color', value: 'red' }]);
  }
);

it('should parse nested blocks',
  () =>
  {
    const input = 'div{& span{}}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['div']);
    expect(tree[0].children![0].selectors).toEqual(['& span']);
  }
);

it('should parse nested blocks with properties',
  () =>
  {
    const input = 'div{color:red;& span{color:blue;}}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['div']);
    expect(tree[0].properties).toEqual([{ key: 'color', value: 'red' }]);

    expect(tree[0].children![0].selectors).toEqual(['& span']);
    expect(tree[0].children![0].properties).toEqual([{ key: 'color', value: 'blue' }]);
  }
);