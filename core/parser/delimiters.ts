import { ParsingError } from '.'

export const delimiters:
  Record<string, (state: CssPipeline.ParserState) => void> =
{
  /*
   * Handles the encounter of an opening brace '{' during parsing.
   * This signifies the start of a new CSS block (e.g., a rule set or an at-rule block).
   */
  handleOpeningBrace: (state) =>
  {
    const selector = state.buffer.trim();

    if (selector.length === 0)
    {
      throw new ParsingError('Unexpected opening brace', state);
    }

    const block: CssPipeline.Block = {
      selectors: [...state.selectorStack, selector],
      metadata: { start: { line: state.currentLine, column: state.currentColumn } }
    };

    if (block.selectors.length > 1 && block.selectors.some(s => s.startsWith('@')))
    {
      throw new ParsingError('At-rule mixed with other selectors', state);
    }

    if (state.stack.length > 0)
    {
      const parent = state.stack[state.stack.length - 1];

      parent.children = parent.children ? [...parent.children, block] : [block];
    }
    else
    {
      state.tree.push(block); // root-level block.
    }

    state.stack.push(block);

    state.selectorStack = [];
    state.isNestedSelector = false;
    state.buffer = '';
  },

  /*
   * Handles the encounter of a closing brace '}' during parsing.
   * This signifies the end of the current CSS block (e.g., a rule set or an at-rule block).
   */
  handleClosingBrace: (state) =>
  {
    if (state.stack.length === 0 || state.currentPropertyName)
    {
      throw new ParsingError('Unexpected closing brace', state);
    }

    const block = state.stack.pop()!;

    block.metadata.end = {
      line: state.currentLine, column: state.currentColumn
    };

    state.buffer = '';
  },

  /*
   * Handles the encounter of a semicolon ';' during parsing.
   * This typically signifies the end of a CSS property declaration.
   */
  handleSemicolon: (state) =>
  {
    if (state.isStringLiteral)
    {
      state.buffer += ';';

      return; // early exit > a string literal.
    }

    const value = state.buffer.trim();

    if (!state.currentPropertyName || !value)
    {
      throw new ParsingError(
        'Unexpected semicolon (expected property declaration)', state
      );
    }

    const currentBlock = state.stack[state.stack.length - 1];

    if (!currentBlock)
    {
      throw new ParsingError('Unexpected semicolon (outside block)', state);
    }

    const property = { key: state.currentPropertyName, value };

    if (!currentBlock.properties)
    {
      currentBlock.properties = [];
    }

    currentBlock.properties.push(property);

    state.currentPropertyName = '';
    state.isCustomProperty = false;
    state.buffer = '';
  },

  /*
   * Handles the encounter of a colon ':' during parsing.
   * This typically signifies the separation between a CSS property name and its value,
   * but may also be part of a pseudo-class or pseudo-element selector.
   */
  handleColon: (state) => 
  {
    if (
      state.isAtRule ||
      state.isStringLiteral ||
      state.isNestedSelector ||
      state.stack.length === 0)
    {
      state.buffer += ':';

      return; // early exit > a string literal or nested selector.
    }

    if (state.currentPropertyName && !state.isCustomProperty)
    {
      throw new ParsingError(
        'Unexpected colon (expected property value)', state
      );
    }

    state.currentPropertyName = state.buffer.trim();
    state.isCustomProperty = state.currentPropertyName.startsWith('!');

    state.buffer = '';
  },

  /*
   * Handles the encounter of a comma ',' during parsing.
   * This primarily signifies a separator between multiple selectors in a CSS rule.
   */
  handleComma: (state) => 
  {
    if (state.isStringLiteral ||
      state.currentPropertyName ||
      state.currentParenthesisLevel > 0)
    {
      state.buffer += ',';

      return; // early exit: string literal, property value, or inside parenthesis.
    }

    if (!state.isCustomProperty && state.currentParenthesisLevel === 0)
    {
      const selector = state.buffer.trim();

      if (!selector)
      {
        throw new ParsingError('Unexpected comma (expected selector)', state);
      }

      state.selectorStack.push(selector);
      state.buffer = '';
    }
  },

  /*
   * Handles the encounter of an ampersand '&' during parsing.
   * The ampersand is primarily used in nested selectors to refer to the parent selector.
   */
  handleAmpersand: (state) => 
  {
    state.buffer += '&';

    if (!state.isCustomProperty && !state.isStringLiteral)
    {
      state.isNestedSelector = true;
    }
  },

  /*
   * Handles the encounter of an at-sign '@' during parsing.
   * This character signifies the beginning of an at-rule (e.g., `@media`, `@import`, `@font-face`).
   */
  handleAtSign: (state) => 
  {
    state.buffer += '@';

    if (!state.isCustomProperty)
    {
      state.isAtRule = true;
    }
  },

  /*
   * Handles the encounter of a double quote '"' during parsing.
   * This character signifies the beginning or end of a string literal
   * (e.g., `content` properties or `url()` functions).
   */
  handleDoubleQuote: (state) => 
  {
    state.buffer += '"';

    if (!state.isCustomProperty)
    {
      if (state.isStringLiteral)
      {
        state.isStringLiteral = (
          state.buffer[state.buffer.length - 2] === '\\'
        );
      }
      else
      {
        state.isStringLiteral = true;
      }
    }
  },

  /*
   * Handles the encounter of an opening parenthesis '(' during parsing.
   * This typically signifies the beginning of a function call (e.g., `url()`, `rgb()`) or a grouping.
   */
  handleOpeningParenthesis: (state) => 
  {
    state.buffer += '(';

    if (!state.isCustomProperty && !state.isStringLiteral)
    {
      state.currentParenthesisLevel++;
    }
  },

  /*
   * Handles the encounter of a closing parenthesis ')' during parsing.
   * This typically signifies the end of a function call or a grouping.
   */
  handleClosingParenthesis: (state) => 
  {
    state.buffer += ')';

    if (!state.isCustomProperty && !state.isStringLiteral)
    {
      state.currentParenthesisLevel--;
    }
  }
}