import { makeMutableBlock } from 'modules/transformer'
import { makeParserState } from 'modules/parser'

declare global
{
  /**
   * Contains all the types used by the CSS engine and its plugins.
   */
  namespace CssPipeline
  {
    /**
     * Represents the root of the abstract syntax tree (AST) created by the parser.
     * It's an array of CSS rules, where each block contains selectors, properties,
     * and potentially nested rules (children).
     */
    type AbstractTree = Array<Block>;

    /**
     * Represents a single block of CSS rules, corresponding to one or more selectors,
     * their associated declarations and (possibly) nested rules.
     */
    type Block = {
      /**
       * An array of selectors (or at-rules) associated with the block.
       */
      selectors: string[],

      /**
       * An optional array of valid CSS properties within the block.
       * These properties have been fully parsed into key-value pairs.
       */
      properties?: Property[],

      /**
       * An optional array of nested blocks, allowing for nested rules within the block.
       * This enables the creation of a hierarchical structure of CSS rules using nesting.
       */
      children?: AbstractTree,

      /**
       * Metadata associated with the block. Useful for error reporting or source mapping.
       */
      metadata: {
        start: { line: number, column: number }, end?: { line: number, column: number }
      }
    }

    /**
     * Represents a plugin that operates during the 'input' stage of the CSS engine.
     * Its handler takes the raw input string and returns a modified string.
     */
    type InputPlugin = { stage: 'input', handler: (input: string) => string };

    /**
     * Represents a mutable version of a block, designed to allow modifications to be made
     * to the block's selectors and properties by transformation plugins.
     */
    type MutableBlock = ReturnType<typeof makeMutableBlock>;

    /**
     * Represents a plugin that operates during the 'output' stage of the CSS engine.
     * Its handler takes the current output string and the abstract tree, which can be
     * used to analyze or document the structure. It returns a modified output string.
     */
    type OutputPlugin = { stage: 'output', handler: (result: string, tree: AbstractTree) => string };

    /**
     * Represents the internal state of the parser at a given point during parsing.
     * The exact structure is determined by the `makeParserState` function.
     */
    type ParserState = ReturnType<typeof makeParserState>;

    /**
     * Represents a union of all possible plugin types, categorized by their processing stage.
     * This allows the engine to work with various plugins that modify the input, transform the AST,
     * or modify the final output.
     */
    type Plugin = InputPlugin | TransformPlugin | OutputPlugin;

    /**
     * Represents a single CSS property, consisting of a property name and its corresponding value.
     */
    type Property = { key: string, value: string };

    /**
     * Represents the internal state of the rendering process, containing the accumulated output.
     * The `output` record maps selectors or other identifiers to an array of media queries.
     */
    type RenderState = { output: Record<string, string[]> };

    /**
     * Represents a plugin that operates during the 'transform' stage of the CSS engine.
     * The handler takes a `MutableBlock` and can modify its selectors and properties.
     */
    type TransformPlugin = { stage: 'transform', handler: (block: MutableBlock) => void };
  }
}