/**
 * Transforms the abstract syntax tree by applying a series of plugins.
 */
export const transformTree = (
  tree: CssPipeline.AbstractTree, plugins: CssPipeline.TransformPlugin[]) =>
{
  for (const block of tree)
  {
    try
    {
      const mutableBlock = makeMutableBlock(block);

      for (const plugin of plugins)
      {
        plugin.handler(mutableBlock);
      }

      if (block.children)
      {
        transformTree(block.children, plugins);
      }
    }
    catch (error)
    {
      throw new Error(
        `Transformation error: ${error.message}` +
        (block.metadata ? ` @ line ${block.metadata.start.line}` : '')
      );
    }
  }
}

/**
 * Creates a mutable representation of a CSS block for transformations.
 */
export const makeMutableBlock = (block: CssPipeline.Block) =>
{
  block.properties = block.properties || [];

  return {
    /**
     * Checks whether the block has children.
     */
    hasChildren: () =>
    {
      return block.children !== undefined && block.children.length > 0;
    },

    /**
     * Return a copy of the block's current selectors.
     */
    getSelectors: () =>
    {
      return [...block.selectors];
    },

    /**
     * Replace the block's current selectors with the given new selectors.
     */
    setSelectors: (newSelectors: string[]) =>
    {
      // TODO: add validation!

      block.selectors = [...newSelectors];
    },

    /**
     * Checks whether the block has a property with the specified key.
     */
    hasProperty: (key: string) => 
    {
      return block.properties!.some(property => property.key === key);
    },

    /**
     * Return the value associated with the specified key,
     * or `undefined` if it does not exist.
     */
    getProperty: (key: string) =>
    {
      return block.properties!.find(property => property.key === key)?.value;
    },

    /**
     * Return a copy of the block's properties.
     */
    getProperties: () =>
    {
      return [...block.properties!.map(property => ({ ...property }))];
    },

    /**
     * Set the property with the specified key to the provided value.
     */
    setProperty: (key: string, value: string) =>
    {
      const property = block.properties!.find(property => property.key === key);

      if (property)
      {
        property.value = value;
      }
      else
      {
        block.properties!.push({ key, value });
      }
    },

    /**
     * Remove the property with the specified key.
     */
    removeProperty: (key: string) =>
    {
      block.properties = block.properties!.filter(property => property.key !== key);
    }
  }
}