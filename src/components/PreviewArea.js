import React from "react";
import CatSprite from "./CatSprite";

const SPRITE_WIDTH = 95.18;
const SPRITE_HEIGHT = 100.04;

export default function PreviewArea({
  sprites,
  selectedSpriteId,
  onSelectSprite,
  onAddSprite,
  onSpritesCollide,
}) {
  const previewRef = React.useRef(null);
  const [previewSize, setPreviewSize] = React.useState({ width: 0, height: 0 });
  const activeCollisionsRef = React.useRef(new Set());
  const previousPositionsRef = React.useRef(new Map());
  const onSpritesCollideRef = React.useRef(onSpritesCollide);
  onSpritesCollideRef.current = onSpritesCollide;

  React.useLayoutEffect(() => {
    function updatePreviewSize() {
      if (previewRef.current) {
        setPreviewSize({
          width: previewRef.current.clientWidth,
          height: previewRef.current.clientHeight,
        });
      }
    }

    updatePreviewSize();
    window.addEventListener("resize", updatePreviewSize);
    return () => window.removeEventListener("resize", updatePreviewSize);
  }, []);

  React.useEffect(() => {
    const collisions = new Set();
    const spriteBounds = sprites.map((sprite) => {
      const radians = (sprite.rotation * Math.PI) / 180;
      return {
        sprite,
        width:
          Math.abs(Math.cos(radians)) * SPRITE_WIDTH +
          Math.abs(Math.sin(radians)) * SPRITE_HEIGHT,
        height:
          Math.abs(Math.sin(radians)) * SPRITE_WIDTH +
          Math.abs(Math.cos(radians)) * SPRITE_HEIGHT,
      };
    });

    for (let firstIndex = 0; firstIndex < spriteBounds.length; firstIndex += 1) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < spriteBounds.length;
        secondIndex += 1
      ) {
        const first = spriteBounds[firstIndex];
        const second = spriteBounds[secondIndex];
        const pairKey = [first.sprite.id, second.sprite.id]
          .sort((left, right) => left - right)
          .join(":");
        const overlaps =
          Math.abs(first.sprite.position.x - second.sprite.position.x) <
            (first.width + second.width) / 2 &&
          Math.abs(first.sprite.position.y - second.sprite.position.y) <
            (first.height + second.height) / 2;
        const previousFirstPosition = previousPositionsRef.current.get(
          first.sprite.id,
        );
        const previousSecondPosition = previousPositionsRef.current.get(
          second.sprite.id,
        );
        const firstMoved =
          previousFirstPosition &&
          (previousFirstPosition.x !== first.sprite.position.x ||
            previousFirstPosition.y !== first.sprite.position.y ||
            previousFirstPosition.rotation !== first.sprite.rotation);
        const secondMoved =
          previousSecondPosition &&
          (previousSecondPosition.x !== second.sprite.position.x ||
            previousSecondPosition.y !== second.sprite.position.y ||
            previousSecondPosition.rotation !== second.sprite.rotation);

        if (overlaps) {
          if (activeCollisionsRef.current.has(pairKey)) {
            collisions.add(pairKey);
          } else if (
            previousFirstPosition &&
            previousSecondPosition &&
            (firstMoved || secondMoved)
          ) {
            collisions.add(pairKey);
            onSpritesCollideRef.current(first.sprite.id, second.sprite.id);
          }
        }
      }
    }

    activeCollisionsRef.current = collisions;
    previousPositionsRef.current = new Map(
      sprites.map((sprite) => [
        sprite.id,
        {
          x: sprite.position.x,
          y: sprite.position.y,
          rotation: sprite.rotation,
        },
      ]),
    );
  }, [sprites]);

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col p-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {sprites.map((sprite) => (
          <button
            key={sprite.id}
            type="button"
            onClick={() => onSelectSprite(sprite.id)}
            className={`flex-none rounded border px-2 py-1 text-xs ${
              sprite.id === selectedSpriteId
                ? "border-blue-600 bg-blue-100 text-blue-800"
                : "border-gray-300 bg-white text-gray-700"
            }`}
            aria-pressed={sprite.id === selectedSpriteId}
          >
            {sprite.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddSprite}
          className="flex-none rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
          aria-label="Add sprite"
        >
          + Add Sprite
        </button>
      </div>
      <div
        ref={previewRef}
        className="relative flex-1 min-h-0 overflow-hidden"
        aria-label="Sprite stage"
      >
        {sprites.map((sprite) => {
          const radians = (sprite.rotation * Math.PI) / 180;
          const rotatedWidth =
            Math.abs(Math.cos(radians)) * SPRITE_WIDTH +
            Math.abs(Math.sin(radians)) * SPRITE_HEIGHT;
          const rotatedHeight =
            Math.abs(Math.sin(radians)) * SPRITE_WIDTH +
            Math.abs(Math.cos(radians)) * SPRITE_HEIGHT;
          const maxX = Math.max(0, (previewSize.width - rotatedWidth) / 2);
          const maxY = Math.max(0, (previewSize.height - rotatedHeight) / 2);
          const boundedX = Math.min(Math.max(sprite.position.x, -maxX), maxX);
          const boundedY = Math.min(Math.max(sprite.position.y, -maxY), maxY);
          const left = previewSize.width / 2 + boundedX - SPRITE_WIDTH / 2;
          const top = previewSize.height / 2 - boundedY - SPRITE_HEIGHT / 2;

          return (
            <div
              key={sprite.id}
              className={`absolute top-0 left-0 ${
                sprite.id === selectedSpriteId ? "z-10" : "z-0"
              }`}
              style={{
                transform: `translate(${left}px, ${top}px)`,
                transition: "transform 300ms ease",
              }}
              onClick={() => onSelectSprite(sprite.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${sprite.name}`}
            >
              {sprite.speech && (
                <div className="absolute left-1/2 bottom-full z-10 mb-3 -translate-x-1/2">
                  {sprite.speech.type === "say" ? (
                    <div className="relative max-w-xs break-words rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow">
                      {sprite.speech.text}
                      <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-gray-300 bg-white" />
                    </div>
                  ) : (
                    <div className="relative max-w-xs break-words rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow">
                      {sprite.speech.text}
                      <span className="absolute -bottom-2 left-4 h-2 w-2 rounded-full border border-gray-300 bg-white" />
                      <span className="absolute -bottom-4 left-2 h-1.5 w-1.5 rounded-full border border-gray-300 bg-white" />
                    </div>
                  )}
                </div>
              )}
              <div
                style={{
                  transform: `rotate(${sprite.rotation}deg)`,
                  transition: "transform 300ms ease",
                  transformOrigin: "center",
                }}
              >
                <CatSprite />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
