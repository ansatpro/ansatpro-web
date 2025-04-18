"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// 7 个大项代表的编号和描述
const ansatItems = [
  { code: "1", text: "Thinks critically and analyses nursing practice" },
  { code: "2", text: "Engages in therapeutic and professional relationships" },
  { code: "3", text: "Maintains the capability for practice" },
  { code: "4", text: "Comprehensively conducts assessments" },
  { code: "5", text: "Develops a plan for nursing practice" },
  { code: "6", text: "Provides safe, appropriate and responsive quality nursing practice" },
  { code: "7", text: "Evaluates outcomes to inform nursing practice" }
];

export default function AnsatItemsReview({ aiResults = [], onConfirm }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isNegative, setIsNegative] = useState({});

  // 初始化时设置推荐项
  useEffect(() => {
    if (aiResults.length > 0) {
      setSelectedItems(aiResults);
    }
  }, [aiResults]);

  // 切换是否选中某个大项
  const toggleItem = (code) => {
    setSelectedItems((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );

    setIsNegative((prev) => {
      const updated = { ...prev };
      if (selectedItems.includes(code)) {
        delete updated[code]; // 取消选择时也移除负面标记
      }
      return updated;
    });
  };

  // 切换某项是否为负面
  const toggleNegative = (code) => {
    setIsNegative((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // 提交结构：{ "1": false, "2": true, ... }
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
