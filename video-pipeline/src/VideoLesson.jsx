/**
 * VideoLesson v2 — Main video composition.
 * Maps scenes to components with smooth transitions.
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ContentScene } from "./scenes/ContentScene";
import { OutroScene } from "./scenes/OutroScene";
import { WhiteboardTitleScene } from "./scenes/WhiteboardTitleScene";
import { WhiteboardContentScene } from "./scenes/WhiteboardContentScene";
import { WhiteboardOutroScene } from "./scenes/WhiteboardOutroScene";
import { SceneTransition } from "./components/SceneTransition";

const sceneComponents = {
  title: TitleScene,
  content: ContentScene,
  outro: OutroScene,
  "wb-title": WhiteboardTitleScene,
  "wb-content": WhiteboardContentScene,
  "wb-outro": WhiteboardOutroScene,
};

export const VideoLesson = ({ scenes = [] }) => {
  let frameOffset = 0;

  // Calculate total frames for progress bar
  const totalFrames = scenes.reduce(
    (sum, s) => sum + (s.durationInFrames || 150),
    0
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#f7f3eb" }}>
      {scenes.map((scene, i) => {
        const Component = sceneComponents[scene.type] || ContentScene;
        const from = frameOffset;
        const duration = scene.durationInFrames || 150;
        frameOffset += duration;

        // Calculate scene progress (0-1) for progress bar
        const sceneEndFrame = frameOffset;
        const sceneProgress = sceneEndFrame / totalFrames;

        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <SceneTransition durationInFrames={duration}>
              <Component
                {...scene}
                sceneProgress={sceneProgress}
                sectionLabel={scene.sectionLabel || ""}
              />
            </SceneTransition>
            {scene.audioFile && <Audio src={staticFile(scene.audioFile)} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
