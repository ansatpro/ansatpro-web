/**
 * @fileoverview ANSAT Items Review Component
 * @description Component for reviewing and selecting ANSAT (Australian Nursing Standards Assessment Tool) items.
 */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * @constant {Array} ansatItems
 * @description List of ANSAT items with their codes and descriptions
 * @type {Array<{code: string, text: string}>}
 */
const ansatItems = [
  { code: "1", text: "Thinks critically and analyses nursing practice" },
  { code: "2", text: "Engages in therapeutic and professional relationships" },
  { code: "3", text: "Maintains the capability for practice" },
  { code: "4", text: "Comprehensively conducts assessments" },
  { code: "5", text: "Develops a plan for nursing practice" },
  { code: "6", text: "Provides safe, appropriate and responsive quality nursing practice" },
  { code: "7", text: "Evaluates outcomes to inform nursing practice" }
];

/**
 * @function AnsatItemsReview
 * @description Component for reviewing and selecting ANSAT items with optional negative marking
 * @param {Object} props - Component props
 * @param {Array<string>} props.aiResults - Array of recommended ANSAT item codes
 * @param {Function} props.onConfirm - Callback function when items are confirmed
 * @returns {JSX.Element} The ANSAT items review interface
 */
export default function AnsatItemsReview({ aiResults = [], onConfirm }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isNegative, setIsNegative] = useState({});

  /**
   * @function useEffect
   * @description Initializes selected items with AI recommendations
   */
  useEffect(() => {
    if (aiResults.length > 0) {
      setSelectedItems(aiResults);
    }
  }, [aiResults]);

  /**
   * @function toggleItem
   * @description Toggles the selection of an ANSAT item
   * @param {string} code - The ANSAT item code to toggle
   */
  const toggleItem = (code) => {
    setSelectedItems((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );

    setIsNegative((prev) => {
      const updated = { ...prev };
      if (selectedItems.includes(code)) {
        delete updated[code]; // Remove negative mark when unselected
      }
      return updated;
    });
  };

  /**
   * @function toggleNegative
   * @description Toggles the negative status of a selected ANSAT item
   * @param {string} code - The ANSAT item code to toggle negative status
   */
  const toggleNegative = (code) => {
    setIsNegative((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  /**
   * @function handleConfirm
   * @description Handles the confirmation of selected items and their negative status
   */
  const handleConfirm = () => {
    const finalPayload = {};
    selectedItems.forEach((code) => {
      finalPayload[code] = isNegative[code] === true;
    });
    onConfirm(finalPayload);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">ANSAT Items</h2>
      <p className="text-gray-500 mb-4">Please select one or more options and indicate if any are negative.</p>

      <div className="space-y-4 mb-8">
        {ansatItems.map((item) => (
          <div key={item.code} className="p-3 hover:bg-gray-50 rounded-lg transition-colors space-y-1 border">
            <div className="flex items-start space-x-3">
              <Checkbox
                id={`item-${item.code}`}
                checked={selectedItems.includes(item.code)}
                onCheckedChange={() => toggleItem(item.code)}
                className="mt-1"
              />
              <label
                htmlFor={`item-${item.code}`}
                className="text-base leading-relaxed cursor-pointer"
              >
                {item.code}. {item.text}
              </label>
            </div>

            {selectedItems.includes(item.code) && (
              <div className="pl-8 flex items-center space-x-3 text-sm text-gray-600 mt-1">
                <label>Is this a negative comment?</label>
                <Checkbox
                  checked={isNegative[item.code] || false}
                  onCheckedChange={() => toggleNegative(item.code)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end sticky bottom-4">
        <Button
          disabled={selectedItems.length === 0}
          onClick={handleConfirm}
          className="w-full sm:w-auto px-8"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}
