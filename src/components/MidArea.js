import React from "react";

function describeBlock(block) {
  switch (block.type) {
    case "move":
      return `Move ${block.steps} steps`;
    case "turn":
      return `Turn ${Math.abs(block.degrees)} degrees ${
        block.degrees < 0 ? "counterclockwise" : "clockwise"
      }`;
    case "goto":
      return `Go to x: ${block.x}, y: ${block.y}`;
    case "say":
      return `Say ${block.text} for ${block.duration} seconds`;
    case "think":
      return `Think ${block.text} for ${block.duration} seconds`;
    default:
      return "Unknown block";
  }
}

export default function MidArea({
  scriptBlocks,
  onDropBlock,
  onRunBlock,
  onPlay,
  onStop,
  isPlaying,
  hasScripts,
}) {
  return (
    <div
      className="flex-1 min-w-0 h-full overflow-auto p-4"
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropBlock(event);
      }}
      aria-label="Scripts workspace. Drop Looks blocks here."
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-gray-500 text-sm">
          {"Scripts workspace — drag blocks here"}
        </div>
        {isPlaying ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            disabled={!hasScripts}
            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Play all sprite scripts"
          >
            ▶ Play All
          </button>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        {scriptBlocks.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onRunBlock(block)}
            className={`max-w-full rounded px-3 py-2 text-white text-sm text-left ${
              block.type === "say" || block.type === "think"
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            aria-label={`${describeBlock(block)}. Click to run.`}
          >
            {describeBlock(block)}
          </button>
        ))}
      </div>
    </div>
  );
}
