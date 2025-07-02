import { it, expect } from 'bun:test'
import { createTreeFromString } from '..'

it('should throw an error when reaching the end of the string with unclosed blocks',
  () => expect(() => createTreeFromString('div{}span{')).toThrowError('Unexpected end of string')
);

it('should throw an error when encountering an unexpected closing brace',
  () => expect(() => createTreeFromString('div{}span}')).toThrowError('Unexpected closing brace')
);

it('should throw an error when encountering an unexpected colon',
  () => expect(() => createTreeFromString('div{color::red;}')).toThrowError('Unexpected colon')
);

it('should throw an error when encountering an unexpected semicolon',
  () => expect(() => createTreeFromString('div{color;}')).toThrowError('Unexpected semicolon')
);

it('should throw an error when encountering an unexpected semicolon (missing property value)',
  () => expect(() => createTreeFromString('div{color:;}')).toThrowError('Unexpected semicolon')
);

it('should throw an error when encountering an unexpected comma (missing selector)',
  () => expect(() => createTreeFromString(',div,span{}')).toThrowError('Unexpected comma (expected selector)')
);