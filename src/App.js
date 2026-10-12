import React from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

const initialSprite = {
  id: 1,
  name: "Sprite 1",
  position: { x: 0, y: 0 },
  rotation: 0,
  speech: null,
  scriptBlocks: [],
};

export default function App() {
  const [sprites, setSprites] = React.useState([initialSprite]);
  const [selectedSpriteId, setSelectedSpriteId] = React.useState(initialSprite.id);
  const [isRepeating, setIsRepeating] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const spriteIdRef = React.useRef(initialSprite.id);
  const lastMotionRef = React.useRef(new Map());
  const repeatTimerRef = React.useRef(null);
  const speechTimersRef = React.useRef(new Map());
  const scriptBlockIdRef = React.useRef(0);
  const playbackIdRef = React.useRef(0);
  const playbackTimersRef = React.useRef(new Set());

  const selectedSprite = sprites.find((sprite) => sprite.id === selectedSpriteId);

  function updateSprite(spriteId, update) {
    setSprites((currentSprites) =>
      currentSprites.map((sprite) =>
        sprite.id === spriteId ? update(sprite) : sprite,
      ),
    );
  }

  function stopRepeating() {
    if (repeatTimerRef.current !== null) {
      window.clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    setIsRepeating(false);
  }

  React.useEffect(
    () => () => {
      if (repeatTimerRef.current !== null) {
        window.clearTimeout(repeatTimerRef.current);
      }
      speechTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      playbackTimersRef.current.forEach(({ timer }) =>
        window.clearTimeout(timer),
      );
    },
    [],
  );

  function moveSprite(spriteId, steps) {
    updateSprite(spriteId, (sprite) => {
      const radians = (sprite.rotation * Math.PI) / 180;
      return {
        ...sprite,
        position: {
          x: sprite.position.x + steps * Math.cos(radians),
          y: sprite.position.y - steps * Math.sin(radians),
        },
      };
    });
  }

  function runMotion(spriteId, action) {
    stopPlayback();
    stopRepeating();
    lastMotionRef.current.set(spriteId, action);
    action(spriteId);
  }

  function moveBySteps(steps) {
    const spriteId = selectedSpriteId;
    runMotion(spriteId, (targetSpriteId) =>
      moveSprite(targetSpriteId, steps),
    );
  }

  function goToPosition(x, y) {
    const spriteId = selectedSpriteId;
    runMotion(spriteId, (targetSpriteId) =>
      updateSprite(targetSpriteId, (sprite) => ({
        ...sprite,
        position: { x, y },
      })),
    );
  }

  function turnSprite(degrees) {
    const spriteId = selectedSpriteId;
    runMotion(spriteId, (targetSpriteId) =>
      updateSprite(targetSpriteId, (sprite) => ({
        ...sprite,
        rotation: sprite.rotation + degrees,
      })),
    );
  }

  function swapSpriteAnimations(firstSpriteId, secondSpriteId) {
    const firstMotion = lastMotionRef.current.get(firstSpriteId);
    const secondMotion = lastMotionRef.current.get(secondSpriteId);

    if (secondMotion) {
      lastMotionRef.current.set(firstSpriteId, secondMotion);
    } else {
      lastMotionRef.current.delete(firstSpriteId);
    }
    if (firstMotion) {
      lastMotionRef.current.set(secondSpriteId, firstMotion);
    } else {
      lastMotionRef.current.delete(secondSpriteId);
    }

    setSprites((currentSprites) =>
      currentSprites.map((sprite) => {
        if (sprite.id === firstSpriteId) {
          const otherSprite = currentSprites.find(
            (candidate) => candidate.id === secondSpriteId,
          );
          return otherSprite
            ? { ...sprite, scriptBlocks: otherSprite.scriptBlocks }
            : sprite;
        }
        if (sprite.id === secondSpriteId) {
          const otherSprite = currentSprites.find(
            (candidate) => candidate.id === firstSpriteId,
          );
          return otherSprite
            ? { ...sprite, scriptBlocks: otherSprite.scriptBlocks }
            : sprite;
        }
        return sprite;
      }),
    );
  }

  function showSpeech(spriteId, type, text, duration) {
    const currentTimer = speechTimersRef.current.get(spriteId);
    if (currentTimer !== undefined) {
      window.clearTimeout(currentTimer);
    }

    updateSprite(spriteId, (sprite) => ({
      ...sprite,
      speech: { type, text },
    }));

    const timer = window.setTimeout(() => {
      updateSprite(spriteId, (sprite) => ({ ...sprite, speech: null }));
      speechTimersRef.current.delete(spriteId);
    }, Math.max(0, duration) * 1000);
    speechTimersRef.current.set(spriteId, timer);
  }

  function addSprite() {
    spriteIdRef.current += 1;
    const sprite = {
      ...initialSprite,
      id: spriteIdRef.current,
      name: `Sprite ${spriteIdRef.current}`,
      position: { x: 0, y: 0 },
    };
    setSprites((currentSprites) => [...currentSprites, sprite]);
    setSelectedSpriteId(sprite.id);
  }

  function addScriptBlock(block) {
    scriptBlockIdRef.current += 1;
    updateSprite(selectedSpriteId, (sprite) => ({
      ...sprite,
      scriptBlocks: [
        ...sprite.scriptBlocks,
        { ...block, id: scriptBlockIdRef.current },
      ],
    }));
  }

  function handleScriptDrop(event) {
    const blockData = event.dataTransfer.getData("application/x-scratch-block");
    if (!blockData) {
      return;
    }

    try {
      const block = JSON.parse(blockData);
      const validBlock =
        (block.type === "move" && Number.isFinite(block.steps)) ||
        (block.type === "turn" && Number.isFinite(block.degrees)) ||
        (block.type === "goto" &&
          Number.isFinite(block.x) &&
          Number.isFinite(block.y)) ||
        ((block.type === "say" || block.type === "think") &&
          typeof block.text === "string" &&
          Number.isFinite(block.duration));
      if (validBlock) {
        addScriptBlock(block);
      }
    } catch (error) {
      console.error("Could not read the dropped script block.", error);
    }
  }

  function runScriptBlock(block) {
    executeScriptBlock(selectedSpriteId, block);
  }

  function executeScriptBlock(spriteId, block) {
    switch (block.type) {
      case "move":
        moveSprite(spriteId, block.steps);
        return 350;
      case "turn":
        updateSprite(spriteId, (sprite) => ({
          ...sprite,
          rotation: sprite.rotation + block.degrees,
        }));
        return 350;
      case "goto":
        updateSprite(spriteId, (sprite) => ({
          ...sprite,
          position: { x: block.x, y: block.y },
        }));
        return 350;
      case "say":
      case "think":
        showSpeech(spriteId, block.type, block.text, block.duration);
        return Math.max(0, block.duration) * 1000;
      default:
        return 0;
    }
  }

  function waitForPlayback(milliseconds) {
    if (milliseconds <= 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const playbackTimer = { timer: null, resolve };
      playbackTimer.timer = window.setTimeout(() => {
        playbackTimersRef.current.delete(playbackTimer);
        resolve();
      }, milliseconds);
      playbackTimersRef.current.add(playbackTimer);
    });
  }

  function stopPlayback() {
    playbackIdRef.current += 1;
    playbackTimersRef.current.forEach(({ timer, resolve }) => {
      window.clearTimeout(timer);
      resolve();
    });
    playbackTimersRef.current.clear();
    setIsPlaying(false);
  }

  async function playAllSprites() {
    stopRepeating();
    const playbackId = playbackIdRef.current + 1;
    playbackIdRef.current = playbackId;
    setIsPlaying(true);

    await Promise.all(
      sprites.map(async (sprite) => {
        for (const block of sprite.scriptBlocks) {
          if (playbackIdRef.current !== playbackId) {
            return;
          }
          const duration = executeScriptBlock(sprite.id, block);
          await waitForPlayback(duration);
        }
      }),
    );

    if (playbackIdRef.current === playbackId) {
      setIsPlaying(false);
    }
  }

  function repeatLastMotion(count) {
    if (!lastMotionRef.current.has(selectedSpriteId) || count < 1) {
      return;
    }

    stopRepeating();
    setIsRepeating(true);

    const spriteId = selectedSpriteId;
    let remaining = count;
    function runNext() {
      const action = lastMotionRef.current.get(spriteId);
      if (!action) {
        repeatTimerRef.current = null;
        setIsRepeating(false);
        return;
      }
      action(spriteId);
      remaining -= 1;

      if (remaining > 0) {
        repeatTimerRef.current = window.setTimeout(runNext, 350);
      } else {
        repeatTimerRef.current = null;
        setIsRepeating(false);
      }
    }

    runNext();
  }

  return (
    <div className="h-screen bg-blue-100 pt-6 font-sans">
      <div className="h-full min-h-0 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
          <Sidebar
            onMove={moveBySteps}
            onTurn={turnSprite}
            onGoTo={goToPosition}
            onRepeat={repeatLastMotion}
            onStopRepeat={stopRepeating}
            hasLastMotion={lastMotionRef.current.has(selectedSpriteId)}
            isRepeating={isRepeating}
            onShowSpeech={(type, text, duration) =>
              showSpeech(selectedSpriteId, type, text, duration)
            }
            onDragBlock={(event, block) => {
              event.dataTransfer.setData(
                "application/x-scratch-block",
                JSON.stringify(block),
              );
              event.dataTransfer.effectAllowed = "copy";
            }}
          />
          <MidArea
            scriptBlocks={selectedSprite ? selectedSprite.scriptBlocks : []}
            onDropBlock={handleScriptDrop}
            onRunBlock={runScriptBlock}
            onPlay={playAllSprites}
            onStop={stopPlayback}
            isPlaying={isPlaying}
            hasScripts={sprites.some((sprite) => sprite.scriptBlocks.length > 0)}
          />
        </div>
        <div className="w-full md:w-1/3 h-40 md:h-full flex-none min-w-0 overflow-hidden flex flex-row bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
          <PreviewArea
            sprites={sprites}
            selectedSpriteId={selectedSpriteId}
            onSelectSprite={setSelectedSpriteId}
            onAddSprite={addSprite}
            onSpritesCollide={swapSpriteAnimations}
          />
        </div>
      </div>
    </div>
  );
}
