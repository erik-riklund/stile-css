/*
 * Copyright (C) 2025 Erik Riklund (Gopher)
 * <https://github.com/erik-riklund>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { createTreeFromString } from './parser'
import { transformTree } from './transformer'
import { renderTreeToString } from './renderer'

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
    transformTree(tree, transformPlugins);

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