import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import pathfinder from "./scenes/pathfinder?scene";

export default makeProject({
  scenes: [example, pathfinder],
});
