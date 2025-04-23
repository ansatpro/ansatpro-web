"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, functions } from "../../appwrite";
import PreceptorLayout from "@/components/layout/preceptorLayout";

export default function PreceptorAiFeedbackPage() {
  const router = useRouter();

  const [payload, setPayload] = useState(null);
  const [assessmentItems, setAssessmentItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [itemPositivity, setItemPositivity] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("preceptorPayload");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPayload(parsed);

        const fetchData = async () => {
          try {
            const res = await functions.createExecution(
              "guest_request",
              JSON.stringify({ action: "getAssessmentItems" })
            );
            const result = JSON.parse(res.responseBody);
            setAssessmentItems(result.standardItems || []);

            const jwt = localStorage.getItem("jwt");

            const aiExecution = await functions.createExecution(
              "67ffd00400174f76be85",
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
          } catch (err) {
            console.error("❌ Error fetching data:", err);
          }
        };

        fetchData();
      } catch (err) {
        console.error("❌ Failed to parse payload:", err);
      }
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!payload) return;
    try {
      const jwt = localStorage.getItem("jwt");

      const fullPayload = {
        ...payload,
        ai_item_list: itemPositivity,
      };

      const res = await functions.createExecution(
        "67ffd00400174f76be85",
        JSON.stringify({
          jwt,
          action: "addPreceptorFeedback",
          payload: fullPayload,
        })
      );

      const result = JSON.parse(res.responseBody);
      if (result.status === "success") {
        localStorage.removeItem("preceptorPayload");
        router.push("/preceptor/success"); // ✅ 成功后跳转
      } else {
        alert("❌ Submission failed: " + result.message);
      }
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("Something went wrong while submitting.");
    }
  };

  return (
    <PreceptorLayout>
      <main className="p-8 font-['Roboto']">
        <div className="max-w-3xl mx-auto">
          {/* 顶部说明 */}
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

          {/* 滚动容器区域 */}
          <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2 border-t pt-4 mb-6">
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

          {/* 提交按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-[#3A6784] hover:bg-[#2d5268] text-white font-medium rounded-lg shadow transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </main>
    </PreceptorLayout>
  );
}
