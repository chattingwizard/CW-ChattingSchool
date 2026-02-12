import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ContentScene } from "./scenes/ContentScene";
import { OutroScene } from "./scenes/OutroScene";
import { WhiteboardTitleScene } from "./scenes/WhiteboardTitleScene";
import { WhiteboardContentScene } from "./scenes/WhiteboardContentScene";
import { WhiteboardOutroScene } from "./scenes/WhiteboardOutroScene";

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

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {scenes.map((scene, i) => {
        const Component = sceneComponents[scene.type] || ContentScene;
        const from = frameOffset;
        const duration = scene.durationInFrames || 150;
        frameOffset += duration;

        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <Component {...scene} />
            {scene.audioFile && (
              <Audio src={staticFile(scene.audioFile)} />
            )}
          </Sequence>
        );
      })}

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 30,
          color: "rgba(255,255,255,0.15)",
          fontSize: 18,
          fontFamily: "Arial, sans-serif",
          letterSpacing: 1,
        }}
      >
        Chatting Wizard School
      </div>
    </AbsoluteFill>
  );
};
