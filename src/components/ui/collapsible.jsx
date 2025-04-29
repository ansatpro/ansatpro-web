/**
 * @fileoverview Collapsible Components
 * @description A collection of components for creating collapsible content sections.
 */

"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * @function Collapsible
 * @description Main collapsible container component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Collapsible container
 */
function Collapsible({
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/**
 * @function CollapsibleTrigger
 * @description Component that triggers the collapsible content
 * @param {Object} props - Component props
 * @returns {JSX.Element} Collapsible trigger
 */
function CollapsibleTrigger({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />);
}

/**
 * @function CollapsibleContent
 * @description Content component for collapsible section
 * @param {Object} props - Component props
 * @returns {JSX.Element} Collapsible content
 */
function CollapsibleContent({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
