/**
 * @fileoverview Rotating Text Component
 * @description A component that animates text rotation with various customization options.
 */

"use client";

import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @function cn
 * @description Utility function to combine class names
 * @param {...string} classes - Class names to combine
 * @returns {string} Combined class names
 */
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

/**
 * @function RotatingText
 * @description Component that animates text rotation with customizable transitions and effects
 * @param {Object} props - Component props
 * @param {Array<string>} props.texts - Array of texts to rotate through
 * @param {Object} props.transition - Framer Motion transition configuration
 * @param {Object} props.initial - Initial animation state
 * @param {Object} props.animate - Animation state
 * @param {Object} props.exit - Exit animation state
 * @param {string} props.animatePresenceMode - AnimatePresence mode
 * @param {boolean} props.animatePresenceInitial - Whether to animate on initial render
 * @param {number} props.rotationInterval - Time between rotations in milliseconds
 * @param {number} props.staggerDuration - Duration of stagger effect
 * @param {string} props.staggerFrom - Starting point for stagger effect
 * @param {boolean} props.loop - Whether to loop through texts
 * @param {boolean} props.auto - Whether to auto-rotate
 * @param {string} props.splitBy - How to split text for animation
 * @param {Function} props.onNext - Callback when text changes
 * @param {string} props.mainClassName - Main container class name
 * @param {string} props.splitLevelClassName - Split level class name
 * @param {string} props.elementLevelClassName - Element level class name
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The rotating text component
 */
const RotatingText = forwardRef((props, ref) => {
    const {
        texts,
        transition = { type: "spring", damping: 25, stiffness: 300 },
        initial = { y: "100%", opacity: 0 },
        animate = { y: 0, opacity: 1 },
        exit = { y: "-120%", opacity: 0 },
        animatePresenceMode = "wait",
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = "first",
        loop = true,
        auto = true,
        splitBy = "characters",
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    /**
     * @function splitIntoCharacters
     * @description Splits text into individual characters using Intl.Segmenter if available
     * @param {string} text - Text to split
     * @returns {Array<string>} Array of characters
     */
    const splitIntoCharacters = (text) => {
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
            return Array.from(segmenter.segment(text), (segment) => segment.segment);
        }
        return Array.from(text);
    };

    /**
     * @function useMemo
     * @description Memoizes the split text elements
     */
    const elements = useMemo(() => {
        const currentText = texts[currentTextIndex];
        if (splitBy === "characters") {
            const words = currentText.split(" ");
            return words.map((word, i) => ({
                characters: splitIntoCharacters(word),
                needsSpace: i !== words.length - 1,
            }));
        }
        if (splitBy === "words") {
            return currentText.split(" ").map((word, i, arr) => ({
                characters: [word],
                needsSpace: i !== arr.length - 1,
            }));
        }
        if (splitBy === "lines") {
            return currentText.split("\n").map((line, i, arr) => ({
                characters: [line],
                needsSpace: i !== arr.length - 1,
            }));
        }
        // For a custom separator
        return currentText.split(splitBy).map((part, i, arr) => ({
            characters: [part],
            needsSpace: i !== arr.length - 1,
        }));
    }, [texts, currentTextIndex, splitBy]);

    /**
     * @function getStaggerDelay
     * @description Calculates stagger delay based on index and configuration
     * @param {number} index - Current element index
     * @param {number} totalChars - Total number of characters
     * @returns {number} Stagger delay in milliseconds
     */
    const getStaggerDelay = useCallback(
        (index, totalChars) => {
            const total = totalChars;
            if (staggerFrom === "first") return index * staggerDuration;
            if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
            if (staggerFrom === "center") {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === "random") {
                const randomIndex = Math.floor(Math.random() * total);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs(staggerFrom - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
    );

    /**
     * @function handleIndexChange
     * @description Handles text index changes
     * @param {number} newIndex - New text index
     */
    const handleIndexChange = useCallback(
        (newIndex) => {
            setCurrentTextIndex(newIndex);
            if (onNext) onNext(newIndex);
        },
        [onNext]
    );

    /**
     * @function next
     * @description Moves to the next text
     */
    const next = useCallback(() => {
        const nextIndex =
            currentTextIndex === texts.length - 1
                ? loop
                    ? 0
                    : currentTextIndex
                : currentTextIndex + 1;
        if (nextIndex !== currentTextIndex) {
            handleIndexChange(nextIndex);
        }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    /**
     * @function previous
     * @description Moves to the previous text
     */
    const previous = useCallback(() => {
        const prevIndex =
            currentTextIndex === 0
                ? loop
                    ? texts.length - 1
                    : currentTextIndex
                : currentTextIndex - 1;
        if (prevIndex !== currentTextIndex) {
            handleIndexChange(prevIndex);
        }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    /**
     * @function jumpTo
     * @description Jumps to a specific text index
     * @param {number} index - Target index
     */
    const jumpTo = useCallback(
        (index) => {
            const validIndex = Math.max(0, Math.min(index, texts.length - 1));
            if (validIndex !== currentTextIndex) {
                handleIndexChange(validIndex);
            }
        },
        [texts.length, currentTextIndex, handleIndexChange]
    );

    /**
     * @function reset
     * @description Resets to the first text
     */
    const reset = useCallback(() => {
        if (currentTextIndex !== 0) {
            handleIndexChange(0);
        }
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(
        ref,
        () => ({
            next,
            previous,
            jumpTo,
            reset,
        }),
        [next, previous, jumpTo, reset]
    );

    /**
     * @function useEffect
     * @description Sets up auto-rotation interval
     */
    useEffect(() => {
        if (!auto) return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    return (
        <motion.span
            className={cn(
                "flex flex-wrap whitespace-pre-wrap relative",
                mainClassName
            )}
            {...rest}
            layout
            transition={transition}
        >
            {/* Screen-reader only text */}
            <span className="sr-only">{texts[currentTextIndex]}</span>
            <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
                <motion.div
                    key={currentTextIndex}
                    className={cn(
                        splitBy === "lines"
                            ? "flex flex-col w-full"
                            : "flex flex-wrap whitespace-pre-wrap relative"
                    )}
                    layout
                    aria-hidden="true"
                >
                    {elements.map((wordObj, wordIndex, array) => {
                        const previousCharsCount = array
                            .slice(0, wordIndex)
                            .reduce((sum, word) => sum + word.characters.length, 0);
                        return (
                            <span key={wordIndex} className={cn("inline-flex", splitLevelClassName)}>
                                {wordObj.characters.map((char, charIndex) => (
                                    <motion.span
                                        key={charIndex}
                                        initial={initial}
                                        animate={animate}
                                        exit={exit}
                                        transition={{
                                            ...transition,
                                            delay: getStaggerDelay(
                                                previousCharsCount + charIndex,
                                                array.reduce((sum, word) => sum + word.characters.length, 0)
                                            ),
                                        }}
                                        className={cn("inline-block", elementLevelClassName)}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
                            </span>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </motion.span>
    );
});

RotatingText.displayName = "RotatingText";
export default RotatingText;
