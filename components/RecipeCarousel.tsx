import React, { useEffect, useRef } from 'react';
import { RecipeResult } from '../App';
import RecipeDisplay from './RecipeDisplay';

interface RecipeCarouselProps {
  results: RecipeResult[];
  currentIndex: number;
  onCurrentIndexChange: (index: number) => void;
  activeCardRef: React.Ref<HTMLDivElement>;
}

const RecipeCarousel: React.FC<RecipeCarouselProps> = ({ results, currentIndex, onCurrentIndexChange, activeCardRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalActiveCardRef = useRef<HTMLDivElement | null>(null);

  // This effect measures the active card's height and applies it to the container.
  // This ensures the container resizes to fit the content, preventing it from
  // overlapping with content below it (like the save button).
  useEffect(() => {
    if (internalActiveCardRef.current && containerRef.current) {
      const setHeight = () => {
        if (internalActiveCardRef.current && containerRef.current) {
          const height = internalActiveCardRef.current.offsetHeight;
          containerRef.current.style.minHeight = `${height}px`;
        }
      };

      // Set initial height
      setHeight();

      // A ResizeObserver is used to automatically update the height if the card's
      // content changes size (e.g., an image loads).
      const resizeObserver = new ResizeObserver(setHeight);
      resizeObserver.observe(internalActiveCardRef.current);

      // Cleanup observer on component unmount or when dependencies change
      return () => resizeObserver.disconnect();
    }
  }, [currentIndex, results]); // Rerun when the active card changes

  return (
    <div ref={containerRef} className="relative w-full" style={{ transition: 'min-height 0.5s ease-out' }}>
      {/* The visible cards are absolutely positioned inside this container */}
      {results.map((result, index) => {
        const offset = index - currentIndex;
        
        // This handles wrapping around for a seamless visual loop effect
        let effectiveOffset = offset;
        if (results.length > 2) {
          if (offset > results.length / 2) {
            effectiveOffset = offset - results.length;
          }
          if (offset < -results.length / 2) {
            effectiveOffset = offset + results.length;
          }
        }

        const isCurrent = effectiveOffset === 0;
        
        // Hide cards that are too far away in the stack for performance
        if (Math.abs(effectiveOffset) > 2) {
            return null;
        }

        return (
          <div
            key={index}
            onClick={() => onCurrentIndexChange(index)}
            className="absolute top-0 left-1/2 w-11/12 max-w-4xl transition-all duration-500 ease-out"
            style={{
              transform: `translateX(calc(-50% + ${effectiveOffset * 20}%)) scale(${isCurrent ? 1 : 0.9}) rotate(${effectiveOffset * 3}deg)`,
              zIndex: results.length - Math.abs(effectiveOffset),
              filter: isCurrent ? 'none' : 'brightness(0.9) blur(1px)',
              cursor: isCurrent ? 'default' : 'pointer',
              opacity: Math.abs(effectiveOffset) > 1 ? 0 : 1, // Fade out distant cards
            }}
          >
            <RecipeDisplay
              ref={(node) => {
                // We need to manage the ref for two purposes:
                // 1. Internal: to measure the height of the active card.
                // 2. External: to allow the parent component to save the card as an image.
                if (index === currentIndex) {
                  internalActiveCardRef.current = node;

                  // Pass the node up to the parent's ref
                  if (typeof activeCardRef === 'function') {
                    activeCardRef(node);
                  } else if (activeCardRef) {
                    (activeCardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                  }
                }
              }}
              recipe={result.recipe}
              imageUrl={result.imageUrl}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RecipeCarousel;