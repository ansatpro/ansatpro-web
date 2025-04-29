/**
 * @fileoverview Text Pressure Component
 * @description A component that creates interactive text with variable font properties based on cursor position.
 */

"use client";

import { useEffect, useRef, useState } from 'react';

/**
 * @function TextPressure
 * @description Component that creates interactive text with variable font properties
 * @param {Object} props - Component props
 * @param {string} props.text - Text to display
 * @param {string} props.fontFamily - Font family name
 * @param {string} props.fontUrl - URL to the variable font file
 * @param {boolean} props.width - Whether to vary font width
 * @param {boolean} props.weight - Whether to vary font weight
 * @param {boolean} props.italic - Whether to vary font italic
 * @param {boolean} props.alpha - Whether to vary text opacity
 * @param {boolean} props.flex - Whether to use flex layout
 * @param {boolean} props.stroke - Whether to add text stroke
 * @param {boolean} props.scale - Whether to scale text to container
 * @param {string} props.textColor - Text color
 * @param {string} props.strokeColor - Stroke color
 * @param {number} props.strokeWidth - Stroke width
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.minFontSize - Minimum font size
 * @returns {JSX.Element} The interactive text component
 */
const TextPressure = ({
    text = 'Compressa',
    fontFamily = 'Compressa VF',
    // This font is just an example, you should not use it in commercial projects.
    fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',

    width = true,
    weight = true,
    italic = true,
    alpha = false,

    flex = true,
    stroke = false,
    scale = false,

    textColor = '#FFFFFF',
    strokeColor = '#FF0000',
    strokeWidth = 2,
    className = '',

    minFontSize = 24,

}) => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const spansRef = useRef([]);

    const mouseRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef({ x: 0, y: 0 });

    const [fontSize, setFontSize] = useState(minFontSize);
    const [scaleY, setScaleY] = useState(1);
    const [lineHeight, setLineHeight] = useState(1);

    const chars = text.split('');

    /**
     * @function dist
     * @description Calculates distance between two points
     * @param {Object} a - First point {x, y}
     * @param {Object} b - Second point {x, y}
     * @returns {number} Distance between points
     */
    const dist = (a, b) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * @function useEffect
     * @description Sets up mouse/touch event listeners and initializes cursor position
     */
    useEffect(() => {
        const handleMouseMove = (e) => {
            cursorRef.current.x = e.clientX;
            cursorRef.current.y = e.clientY;
        };
        const handleTouchMove = (e) => {
            const t = e.touches[0];
            cursorRef.current.x = t.clientX;
            cursorRef.current.y = t.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        if (containerRef.current) {
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            mouseRef.current.x = left + width / 2;
            mouseRef.current.y = top + height / 2;
            cursorRef.current.x = mouseRef.current.x;
            cursorRef.current.y = mouseRef.current.y;
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    /**
     * @function setSize
     * @description Calculates and sets appropriate font size and scaling
     */
    const setSize = () => {
        if (!containerRef.current || !titleRef.current) return;

        const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

        let newFontSize = containerW / (chars.length / 2);
        newFontSize = Math.max(newFontSize, minFontSize);

        setFontSize(newFontSize);
        setScaleY(1);
        setLineHeight(1);

        requestAnimationFrame(() => {
            if (!titleRef.current) return;
            const textRect = titleRef.current.getBoundingClientRect();

            if (scale && textRect.height > 0) {
                const yRatio = containerH / textRect.height;
                setScaleY(yRatio);
                setLineHeight(yRatio);
            }
        });
    };

    /**
     * @function useEffect
     * @description Sets up resize listener and initial size calculation
     */
    useEffect(() => {
        setSize();
        window.addEventListener('resize', setSize);
        return () => window.removeEventListener('resize', setSize);
    }, [scale, text]);

    /**
     * @function useEffect
     * @description Animates text properties based on cursor position
     */
    useEffect(() => {
        let rafId;
        const animate = () => {
            mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
            mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

            if (titleRef.current) {
                const titleRect = titleRef.current.getBoundingClientRect();
                const maxDist = titleRect.width / 2;

                spansRef.current.forEach((span) => {
                    if (!span) return;

                    const rect = span.getBoundingClientRect();
                    const charCenter = {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                    };

                    const d = dist(mouseRef.current, charCenter);

                    /**
                     * @function getAttr
                     * @description Calculates attribute value based on distance
                     * @param {number} distance - Distance from cursor
                     * @param {number} minVal - Minimum attribute value
                     * @param {number} maxVal - Maximum attribute value
                     * @returns {number} Calculated attribute value
                     */
                    const getAttr = (distance, minVal, maxVal) => {
                        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
                        return Math.max(minVal, val + minVal);
                    };

                    const wdth = width ? Math.floor(getAttr(d, 5, 200)) : 100;
                    const wght = weight ? Math.floor(getAttr(d, 100, 900)) : 400;
                    const italVal = italic ? getAttr(d, 0, 1).toFixed(2) : 0;
                    const alphaVal = alpha ? getAttr(d, 0, 1).toFixed(2) : 1;

                    span.style.opacity = alphaVal;
                    span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
                });
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(rafId);
    }, [width, weight, italic, alpha, chars.length]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-transparent"
        >
            <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>

            <h1
                ref={titleRef}
                className={`text-pressure-title ${className} ${flex ? 'flex justify-between' : ''
                    } ${stroke ? 'stroke' : ''} uppercase text-center`}
                style={{
                    fontFamily,
                    fontSize: fontSize,
                    lineHeight,
                    transform: `scale(1, ${scaleY})`,
                    transformOrigin: 'center top',
                    margin: 0,
                    fontWeight: 100,
                    color: stroke ? undefined : textColor,
                }}
            >
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => (spansRef.current[i] = el)}
                        data-char={char}
                        className="inline-block"
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default TextPressure;
