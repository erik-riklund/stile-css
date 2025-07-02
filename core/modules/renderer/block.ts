import { RenderingError } from '.'

/**
 * Renders a single CSS block and its children into the render state.
 */
export const renderBlock = (state: CssPipeline.RenderState,
  block: CssPipeline.Block, context = 'root', parents: string[] = []) =>
{
  if (block.selectors[0].startsWith('@media screen'))
  {
    // Responsive media queries are rendered as separate context blocks.

    if (context.includes('screen'))
    {
      throw new RenderingError(
        'Nested media queries are not supported', block
      );
    }

    if (context.includes('-color-scheme'))
    {
      throw new RenderingError(
        'Responsive media queries cannot be nested inside color scheme at-rules', block
      );
    }

    renderBlockContent(state, block.selectors[0], parents, block);
  }
  else if (block.selectors[0].startsWith('@media')
    && block.selectors[0].includes('-color-scheme'))
  {
    // Color scheme at-rules are either appended to the end of an existing
    // responsive media query, or rendered as a separate context block.

    if (context.includes('-color-scheme'))
    {
      throw new RenderingError(
        'Nested color scheme at-rules are not supported', block
      );
    }

    const targetContext = !context.startsWith('@media screen') ? block.selectors[0] :
      (context + 'and' + block.selectors[0].replace(/^[^(]+(\([^)]+\))[^)]*$/, '$1'));

    renderBlockContent(state, targetContext, parents, block);
  }
  else if (block.selectors[0].startsWith('@'))
  {
    // At-rules that are not media queries are rendered without parent selectors
    // to ensure that their properties are scoped to itself.

    if (context.startsWith('@'))
    {
      throw new RenderingError(
        'Nested at-rules are not supported', block
      );
    }

    renderBlockContent(state, block.selectors[0], [], block);
  }
  else
  {
    // Blocks that are not at-rules are rendered within the specified context,
    // which is usually 'root' or '@media screen', but it can be any at-rule.

    const selectors = block.selectors.flatMap(
      (selector) => parents.length === 0 ? [selector] :
        parents.map(parent => renderSelector(selector, parent))
    );

    renderBlockContent(state, context, selectors, block);
  }
}

/**
 * Renders a selector, potentially combining it with a parent selector.
 */
const renderSelector = (selector: string, parent: string) =>
{
  return selector.includes('&') ? selector.replace(/&/g, parent) : `${parent} ${selector}`;
}

/**
 * Renders an array of CSS properties into a string.
 */
const renderProperties = (properties: CssPipeline.Property[]) =>
{
  return properties.map(property => `${property.key}:${property.value}`).join(';');
}

/**
 * Renders the content of a CSS block (properties and children) into the render state.
 */
const renderBlockContent = (state: CssPipeline.RenderState,
  context: string, selectors: string[], block: CssPipeline.Block) =>
{
  if (!state.output[context])
  {
    state.output[context] = [];
  }

  if (block.properties && block.properties.length > 0)
  {
    state.output[context].push(
      `${selectors.join(',')}{${renderProperties(block.properties)}}`
    );
  }

  if (block.children && block.children.length > 0)
  {
    for (const child of block.children)
    {
      renderBlock(state, child, context, selectors);
    }
  }
}