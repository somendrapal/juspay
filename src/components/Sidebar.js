import React from "react";
import Icon from "./Icon";

export default function Sidebar({
  onMove,
  onTurn,
  onGoTo,
  onRepeat,
  onStopRepeat,
  hasLastMotion,
  isRepeating,
  onShowSpeech,
  onDragBlock,
}) {
  const [steps, setSteps] = React.useState(10);
  const [angle, setAngle] = React.useState(45);
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const [repeatCount, setRepeatCount] = React.useState(5);
  const [sayText, setSayText] = React.useState("Hello!");
  const [sayDuration, setSayDuration] = React.useState(2);
  const [thinkText, setThinkText] = React.useState("Hmm...");
  const [thinkDuration, setThinkDuration] = React.useState(2);

  function activateMove(event) {
    if (event.target.tagName !== "INPUT") {
      onMove(steps);
    }
  }

  function activateTurn(direction, event) {
    if (event.target.tagName !== "INPUT") {
      onTurn(direction * angle);
    }
  }

  function activateGoTo(event) {
    event.stopPropagation();
    onGoTo(x, y);
  }

  function startBlockDrag(event, block) {
    onDragBlock(event, block);
  }

  return (
    <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200">
      <div className="font-bold"> {"Events"} </div>
      <div className="flex flex-row flex-wrap bg-yellow-500 text-white px-2 py-1 my-2 text-sm cursor-pointer">
        {"When "}
        <Icon name="flag" size={15} className="text-green-600 mx-2" />
        {"clicked"}
      </div>
      <div className="flex flex-row flex-wrap bg-yellow-500 text-white px-2 py-1 my-2 text-sm cursor-pointer">
        {"When this sprite clicked"}
      </div>
      <div className="font-bold"> {"Motion"} </div>
      <div
        className="flex flex-row flex-wrap items-center bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(event) => startBlockDrag(event, { type: "move", steps })}
        onClick={activateMove}
        onKeyDown={(event) => {
          if (event.target.tagName === "INPUT") {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onMove(steps);
          }
        }}
        aria-label={`Move ${steps} steps`}
      >
        {"Move "}
        <input
          type="number"
          value={steps}
          onChange={(event) => setSteps(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          className="w-10 mx-1 px-1 text-black text-center"
          aria-label="Number of steps"
        />
        {" steps"}
      </div>
      <div
        onClick={activateGoTo}
        draggable
        onDragStart={(event) => startBlockDrag(event, { type: "goto", x, y })}
        className="flex flex-row flex-wrap items-center bg-blue-500 text-white px-2 py-1 my-2 text-sm"
      >
        {"Go to x: "}
        <input
          type="number"
          value={x}
          onChange={(event) => setX(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-12 mx-1 px-1 text-black text-center"
          aria-label="X position"
        />
        {" y: "}
        <input
          type="number"
          value={y}
          onChange={(event) => setY(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-12 mx-1 px-1 text-black text-center"
          aria-label="Y position"
        />
      </div>
      <div
        className="flex flex-row flex-wrap items-center bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(event) =>
          startBlockDrag(event, { type: "turn", degrees: -angle })
        }
        onClick={(event) => activateTurn(-1, event)}
        onKeyDown={(event) => {
          if (event.target.tagName === "INPUT") {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTurn(-angle);
          }
        }}
        aria-label={`Turn counterclockwise ${angle} degrees`}
      >
        {"Turn "}
        <Icon name="undo" size={15} className="text-white mx-2" />
        <input
          type="number"
          value={angle}
          onChange={(event) => setAngle(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-10 mx-1 px-1 text-black text-center"
          aria-label="Turn angle in degrees"
        />
        {" degrees"}
      </div>
      <div
        className="flex flex-row flex-wrap items-center bg-blue-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(event) =>
          startBlockDrag(event, { type: "turn", degrees: angle })
        }
        onClick={(event) => activateTurn(1, event)}
        onKeyDown={(event) => {
          if (event.target.tagName === "INPUT") {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTurn(angle);
          }
        }}
        aria-label={`Turn clockwise ${angle} degrees`}
      >
        {"Turn "}
        <Icon name="redo" size={15} className="text-white mx-2" />
        <input
          type="number"
          value={angle}
          onChange={(event) => setAngle(Number(event.target.value))}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-10 mx-1 px-1 text-black text-center"
          aria-label="Turn angle in degrees"
        />
        {" degrees"}
      </div>
      <div className="font-bold mt-2">{"Looks"}</div>
      <div
        className="flex flex-row flex-wrap items-center bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(event) =>
          startBlockDrag(event, {
            type: "say",
            text: sayText,
            duration: sayDuration,
          })
        }
        onClick={(event) => {
          if (event.target.tagName !== "INPUT") {
            onShowSpeech("say", sayText, sayDuration);
          }
        }}
        onKeyDown={(event) => {
          if (event.target.tagName !== "INPUT" &&
              (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onShowSpeech("say", sayText, sayDuration);
          }
        }}
        aria-label={`Say ${sayText} for ${sayDuration} seconds. Drag to scripts workspace.`}
      >
        {"Say "}
        <input
          type="text"
          value={sayText}
          onChange={(event) => setSayText(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-20 mx-1 px-1 text-black"
          aria-label="Message to say"
        />
        {" for "}
        <input
          type="number"
          min="0"
          step="0.1"
          value={sayDuration}
          onChange={(event) => {
            const duration = Number(event.target.value);
            setSayDuration(Number.isFinite(duration) ? Math.max(0, duration) : 0);
          }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-12 mx-1 px-1 text-black text-center"
          aria-label="Say duration in seconds"
        />
        {" seconds"}
      </div>
      <div
        className="flex flex-row flex-wrap items-center bg-purple-500 text-white px-2 py-1 my-2 text-sm cursor-pointer"
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(event) =>
          startBlockDrag(event, {
            type: "think",
            text: thinkText,
            duration: thinkDuration,
          })
        }
        onClick={(event) => {
          if (event.target.tagName !== "INPUT") {
            onShowSpeech("think", thinkText, thinkDuration);
          }
        }}
        onKeyDown={(event) => {
          if (event.target.tagName !== "INPUT" &&
              (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onShowSpeech("think", thinkText, thinkDuration);
          }
        }}
        aria-label={`Think ${thinkText} for ${thinkDuration} seconds. Drag to scripts workspace.`}
      >
        {"Think "}
        <input
          type="text"
          value={thinkText}
          onChange={(event) => setThinkText(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-20 mx-1 px-1 text-black"
          aria-label="Thought message"
        />
        {" for "}
        <input
          type="number"
          min="0"
          step="0.1"
          value={thinkDuration}
          onChange={(event) => {
            const duration = Number(event.target.value);
            setThinkDuration(Number.isFinite(duration) ? Math.max(0, duration) : 0);
          }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-12 mx-1 px-1 text-black text-center"
          aria-label="Think duration in seconds"
        />
        {" seconds"}
      </div>
      <div className="font-bold mt-2">{"Controls"}</div>
      <div className="flex flex-row flex-wrap items-center bg-yellow-500 text-white px-2 py-1 my-2 text-sm">
        <span>{"Repeat "}</span>
        <input
          type="number"
          min="1"
          step="1"
          value={repeatCount}
          onChange={(event) => {
            const count = Number(event.target.value);
            setRepeatCount(Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1);
          }}
          className="w-12 mx-1 px-1 text-black text-center"
          aria-label="Repeat count"
          disabled={isRepeating}
        />
        <span>{" times"}</span>
        {isRepeating ? (
          <button
            type="button"
            onClick={onStopRepeat}
            className="ml-2 px-2 py-1 bg-yellow-700 hover:bg-yellow-800 rounded text-white"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRepeat(repeatCount)}
            disabled={!hasLastMotion}
            className="ml-2 px-2 py-1 bg-yellow-700 hover:bg-yellow-800 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Repeat
          </button>
        )}
      </div>
    </div>
  );
}
