import {makeProject} from '@motion-canvas/core';

import audio from '../resources/Audio.mp3';

import car from './scenes/car?scene';
import pathfinder from "./scenes/pathfinder?scene";
import communication from "./scenes/communication?scene";
import drive from "./scenes/drive?scene";

export default makeProject({
    scenes: [car, communication, pathfinder, drive],
    audio: audio
});
