import { it, expect } from 'bun:test'
import { renderTreeToString } from '..'

it('should render a responsive media query',
  () =>
  {
    const tree = [{
      selectors: ['div'],
      children: [
        {
          selectors: ['@media screen and(min-width:576px)'],
          properties: [{ key: 'color', value: 'red' }]
        }
      ]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      '@media screen and(min-width:576px){div{color:red}}'
    );
  }
);

it('should append a color scheme query to a responsive media query',
  () =>
  {
    const tree = [{
      selectors: ['div'],
      children: [
        {
          selectors: ['@media screen and(min-width:576px)'],
          properties: [{ key: 'background-color', value: 'white' }],
          children: [
            {
              selectors: ['@media(prefers-color-scheme:dark)'],
              properties: [{ key: 'background-color', value: 'black' }]
            }
          ]
        }
      ]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      '@media screen and(min-width:576px){div{background-color:white}}' +
      '@media screen and(min-width:576px)and(prefers-color-scheme:dark){div{background-color:black}}'
    );
  }
);

it('should render a `@keyframes` at-rule',
  () =>
  {
    const tree = [{
      selectors: ['@keyframes test'],
      children: [
        {
          selectors: ['from'],
          properties: [{ key: 'opacity', value: '0' }]
        },
        {
          selectors: ['to'],
          properties: [{ key: 'opacity', value: '1' }]
        }
      ]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      '@keyframes test{from{opacity:0}to{opacity:1}}'
    );
  }
);

it('should render a `@scope` at-rule',
  () =>
  {
    const tree = [{
      selectors: ['@scope(.test)'],
      children: [
        {
          selectors: [':scope'],
          properties: [{ key: 'background-color', value: 'salmon' }]
        },
        {
          selectors: ['a'],
          properties: [{ key: 'color', value: 'maroon' }],
          children: [
            {
              selectors: ['&:hover'],
              properties: [{ key: 'color', value: 'blue' }]
            }
          ]
        }
      ]
    }];

    // @ts-expect-error: no metadata.
    expect(renderTreeToString(tree)).toEqual(
      '@scope(.test){:scope{background-color:salmon}a{color:maroon}a:hover{color:blue}}'
    );
  }
);