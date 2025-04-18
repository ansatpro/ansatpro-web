"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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

    useEffect(() => {
        if (aiResults.length > 0) {
            setSelectedItems(aiResults);
        }
    }, [aiResults]);

    const toggleItem = (code) => {
        setSelectedItems(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    const handleConfirm = () => {
        if (selectedItems.length > 0) {
            onConfirm(selectedItems);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">ANSAT Items</h2>
            <p className="text-gray-500 mb-4">Please select one or more options.</p>
            
            <div className="space-y-4 mb-8">
                {ansatItems.map((item) => (
                    <div key={item.code} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
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