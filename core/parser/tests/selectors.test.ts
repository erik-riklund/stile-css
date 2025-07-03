import { it, expect } from 'bun:test'
import { createTreeFromString } from '..'


it('should parse a pseudo-class selector',
  () =>
  {
    const input = 'button:hover{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['button:hover']);
  }
);

it('should parse a nested pseudo-class selector',
  () =>
  {
    const input = 'button{&:hover{}}';
    const tree = createTreeFromString(input);

    expect(tree[0].children![0].selectors).toEqual(['&:hover']);
  }
);

it('should parse a pseudo-element selector',
  () =>
  {
    const input = 'button::before{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['button::before']);
  }
);

it('should parse an attribute selector',
  () =>
  {
    const input = 'button[type="submit"]{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['button[type="submit"]']);
  }
);

it('should parse multiple selectors for a single block',
  () =>
  {
    const input = 'h1,h2{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['h1', 'h2']);
  }
);

it('should parse multiple selectors for a nested block',
  () =>
  {
    const input = 'div{& h1, & h2{}}';
    const tree = createTreeFromString(input);

    expect(tree[0].children![0].selectors).toEqual(['& h1', '& h2']);
  }
);

it('should parse a `@keyframes` selector',
  () =>
  {
    const input = '@keyframes test{}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['@keyframes test']);
  }
);

it('should parse a `@media` selector',
  () =>
  {
    const input = '@media screen and (min-width: 576px){}';
    const tree = createTreeFromString(input);

    expect(tree[0].selectors).toEqual(['@media screen and (min-width: 576px)']);
  }
);

it('should parse a nested `@media` selector',
  () =>
  {
    const input = 'div{color:red;@media screen and (min-width: 576px){color:blue}}';
    const tree = createTreeFromString(input);

    expect(tree[0].children![0].selectors).toEqual(['@media screen and (min-width: 576px)']);
  }
);

it('should parse a selector with commas inside parentheses',
  () =>
  {
    const input = 'div{&:in(a, b){}}';
    const tree = createTreeFromString(input);

    expect(tree[0].children![0].selectors).toEqual(['&:in(a, b)']);
  }
);

it('should parse a selector with commas inside parentheses mixed with other selectors',
  () =>
  {
    const input = 'div{& span, &:is(a, b), & h1{}}';
    const tree = createTreeFromString(input);

    expect(tree[0].children![0].selectors).toEqual(['& span', '&:is(a, b)', '& h1']);
  }
);