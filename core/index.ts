import { createTreeFromString } from './modules/parser'
import { transformTree } from './modules/transformer'
import { renderTreeToString } from './modules/renderer'

/**
 * Creates a new pipeline function that uses the provided plugins to perform
 * input, transform, and output operations on a provided input string.
 */
export const makePipeline = (plugins: CssPipeline.Plugin[] = []) =>
{
  const [
    inputPlugins,
    transformPlugins,
    outputPlugins
  ] = groupPluginsByStage(plugins);

  return (input: string): string =>
  {
    for (const plugin of inputPlugins)
    {
      const result = plugin.handler(input);

      if (typeof result !== 'string')
      {
        throw new Error('Input plugins must return a string');
      }

      input = result;
    }

    const tree = createTreeFromString(input);
    transformTree(tree, [...transformPlugins]);

    let output = renderTreeToString(tree);

    for (const plugin of outputPlugins)
    {
      const result = plugin.handler(output, tree);

      if (typeof result !== 'string')
      {
        throw new Error('Output plugins must return a string');
      }

      output = result;
    }

    return output;
  }
}

/**
 * Groups plugins into input, transform, and output stages.
 */
const groupPluginsByStage = (plugins: CssPipeline.Plugin[]) =>
{
  return [
    plugins.filter((plugin) => plugin.stage === 'input'),
    plugins.filter((plugin) => plugin.stage === 'transform'),
    plugins.filter((plugin) => plugin.stage === 'output')
  ] as [
      CssPipeline.InputPlugin[], CssPipeline.TransformPlugin[], CssPipeline.OutputPlugin[]
    ];
}