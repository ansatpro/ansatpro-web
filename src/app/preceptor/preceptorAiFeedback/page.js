"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, functions } from "../../appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";
import LoadingScreen from '@/components/preceptorUI/LoadingScreen';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * This component handles the AI feedback process for Preceptors.
 * It loads assessment items, receives AI-generated matches, and allows user confirmation.
 * Final selections are deduplicated, sorted, and submitted to the backend.
 */
export default function PreceptorAiFeedbackPage() {
  const router = useRouter();

  const [payload, setPayload] = useState(null);
  const [assessmentItems, setAssessmentItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [itemPositivity, setItemPositivity] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load stored feedback payload and fetch AI results on component mount
  useEffect(() => {
    const stored = localStorage.getItem("preceptorPayload");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPayload(parsed);

        const fetchData = async () => {
          try {
            setIsLoading(true);

            const res = await functions.createExecution(
              process.env.NEXT_PUBLIC_FN_GUEST_REQUEST,
              JSON.stringify({ action: "getAssessmentItems" })
            );
            const result = JSON.parse(res.responseBody);
            setAssessmentItems(result.standardItems || []);

            const jwt = localStorage.getItem("jwt");

            const aiExecution = await functions.createExecution(
              process.env.NEXT_PUBLIC_FN_PRECEPTOR_RELATED,
              JSON.stringify({
                jwt,
                action: "getAiFeedbackPreceptor",
                payload: { text: parsed.content },
              })
            );

            const aiResult = JSON.parse(aiExecution.responseBody);
            const matched = aiResult.matched_ids || [];

            setMatchedIds(matched);
            setSelectedIds(matched);
            setIsLoading(false);
          } catch (err) {
            console.error("Error fetching data:", err);
          }
        };

        fetchData();
      } catch (err) {
        console.error("Failed to parse payload:", err);
      }
    }
  }, []);

  // Toggle selection of an assessment item and update positivity flag
  const toggleSelection = (itemId) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(itemId);
      const updated = isSelected
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      setItemPositivity((prevPositivity) => {
        const newState = { ...prevPositivity };
        if (!isSelected) {
          newState[itemId] = true;
        } else {
          delete newState[itemId];
        }
        return newState;
      });

      return updated;
    });
  };

  // Submit selected items after sorting and deduplication
  const handleSubmit = async () => {
    if (!payload) return;

    try {
      const jwt = localStorage.getItem("jwt");

      // Deduplicate selected item codes
      const finalItemPositivityMap = new Map();
      selectedIds.forEach((id) => {
        if (!finalItemPositivityMap.has(id)) {
          finalItemPositivityMap.set(id, itemPositivity[id] ?? true);
        }
      });

      // Sort items numerically by section.subsection (e.g., 1.1, 1.2, ..., 7.3)
      const finalItemList = Array.from(finalItemPositivityMap.entries()).map(
        ([code, isPositive]) => ({ code, isPositive })
      );

      finalItemList.sort((a, b) => {
        const [aMajor, aMinor] = a.code.split('.').map(Number);
        const [bMajor, bMinor] = b.code.split('.').map(Number);
        return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
      });

      // Convert list to object format for database
      const finalItemPositivity = {};
      finalItemList.forEach(({ code, isPositive }) => {
        finalItemPositivity[code] = isPositive;
      });

      const fullPayload = {
        ...payload,
        ai_item_list: finalItemPositivity,
      };

      const res = await functions.createExecution(
        process.env.NEXT_PUBLIC_FN_PRECEPTOR_RELATED,
        JSON.stringify({
          jwt,
          action: "addPreceptorFeedback",
          payload: fullPayload,
        })
      );

      const result = JSON.parse(res.responseBody);
      if (result.status === "success") {
        localStorage.removeItem("preceptorPayload");
        router.push("/preceptor/success");
      } else {
        alert("Submission failed: " + result.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong while submitting.");
    }
  };

  if (isLoading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingScreen />
      </motion.div>
    );
  }

  return (
    <>
      <PreceptorLayout>
        <main className="p-8 font-['Roboto']">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Confirm ANSAT Items</h1>
              <p className="text-sm text-gray-600 italic">
                {matchedIds.length > 0 ? (
                  <>
                    Based on your feedback, the following ANSAT items are relevant:{" "}
                    {matchedIds.map((id, index) => (
                      <span key={id}>
                        <span className="font-bold">{id}</span>
                        {index < matchedIds.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </>
                ) : (
                  "Based on your feedback, no item is selected. Please select it manually."
                )}
              </p>
            </div>

            <div className="max-h-[330px] overflow-y-auto pr-1 space-y-2 border-t pt-4 mb-6">
              {assessmentItems.map((item) => (
                <label
                  key={item.item_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-md p-3 shadow-sm hover:bg-gray-50 transition"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.item_id)}
                      onChange={() => toggleSelection(item.item_id)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <div>
                      <span className="block font-medium text-gray-900">
                        {item.item_id}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {selectedIds.includes(item.item_id) && (
                    <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                      <label htmlFor={`positive-${item.item_id}`} className="text-sm text-gray-700">
                        Positive?
                      </label>
                      <input
                        id={`positive-${item.item_id}`}
                        type="checkbox"
                        checked={itemPositivity[item.item_id] ?? true}
                        onChange={(e) => {
                          const value = e.target.checked;
                          setItemPositivity((prev) => ({
                            ...prev,
                            [item.item_id]: value,
                          }));
                        }}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded"
                      />
                    </div>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={selectedIds.length === 0}
                className="px-8 py-3 bg-[#3A6784] hover:bg-[#2d5268] text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </Button>
            </div>
          </div>
        </main>
      </PreceptorLayout>
    </>
  );
}
