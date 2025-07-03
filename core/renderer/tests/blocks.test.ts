import { it, expect } from 'bun:test'
import { renderTreeToString } from '..'

it('should return an empty string when the tree is empty',
  () =>
  {
    const tree: CssPipeline.AbstractTree = [];

    expect(renderTreeToString(tree)).toEqual('');
  }
);

it('should render a block with a single selector',
  () =>
  {
    const tree = [{
      selectors: ['div'],
      properties: [{ key: 'color', value: 'red' }]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual('div{color:red}');
  }
);

it('should render a block with multiple properties',
  () =>
  {
    const tree = [{
      selectors: ['div'],
      properties: [
        { key: 'color', value: 'red' },
        { key: 'background-color', value: 'blue' }
      ]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      'div{color:red;background-color:blue}'
    );
  }
);

it('should render a block with a multiple selectors',
  () =>
  {
    const tree = [{
      selectors: ['div', 'span', 'h1'],
      properties: [{ key: 'color', value: 'red' }]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual('div,span,h1{color:red}');
  }
);

it('should render a block with children',
  () =>
  {
    const tree = [{
      selectors: ['section'],
      children: [{
        selectors: ['& h1', '& h2'], children: [
          { selectors: ['& span'], properties: [{ key: 'color', value: 'red' }] }
        ]
      }]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      'section h1 span,section h2 span{color:red}'
    );
  }
);