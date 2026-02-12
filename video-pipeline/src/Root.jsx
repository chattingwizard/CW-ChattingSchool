import React from "react";
import { Composition } from "remotion";
import { VideoLesson } from "./VideoLesson";

export const Root = () => {
  return (
    <Composition
      id="VideoLesson"
      component={VideoLesson}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        scenes: [],
        totalDurationInFrames: 300,
      }}
      calculateMetadata={({ props }) => {
        return {
          durationInFrames: props.totalDurationInFrames || 300,
        };
      }}
    />
  );
};
