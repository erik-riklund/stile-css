/**
 * Creates a set of CSS pipeline plugins that extracts and stores reusable blocks,
 * and expands `!include` directives with the properties from the defined reusable blocks.
 */
export const createReusableBlocksPlugin = (
  prefix = 'reusable', separator = ','): CssPipeline.TransformPlugin[] =>
{
  /**
   * Stores reusable blocks, mapped by their defined name.
   */
  const reusableBlocks: Record<string, CssPipeline.Property[]> = {};

  return [
    {
      stage: 'transform',

      handler: (block) =>
      {
        const selectors = block.getSelectors();

        if (selectors.some(selector => selector.startsWith(prefix)))
        {
          if (selectors.length > 1)
          {
            throw new Error('A reusable block cannot have more than one selector');
          }

          if (block.hasChildren())
          {
            throw new Error('A reusable block cannot have children');
          }

          const name = normalizeReusableBlockName(
            selectors[0].slice(prefix.length + 1)
          );

          if (name in reusableBlocks)
          {
            throw new Error(`Non-unique reusable block name (${name})`);
          }

          reusableBlocks[name] = block.getProperties();

          for (const property of reusableBlocks[name])
          {
            block.removeProperty(property.key);
          }
        }
      }
    },

    {
      stage: 'transform',

      handler: (block) =>
      {
        if (block.hasProperty('!include'))
        {
          const includes = block.getProperty('!include')!;
          const reusableBlockList = includes.split(separator);

          for (const blockName of reusableBlockList)
          {
            const normalizedBlockName = normalizeReusableBlockName(blockName);

            if (!(normalizedBlockName in reusableBlocks))
            {
              throw new Error(`Unknown reusable block (${normalizedBlockName})`);
            }

            for (const property of reusableBlocks[normalizedBlockName])
            {
              block.setProperty(property.key, property.value);
            }
          }

          block.removeProperty('!include');
        }
      }
    }
  ];
}

/**
 * Normalizes a reusable block name by removing quotes,
 * backticks and leading/trailing whitespace.
 */
const normalizeReusableBlockName = (name: string) =>
{
  return name.trim().replace(/(^['"`]|['"`]$)/g, '');
}