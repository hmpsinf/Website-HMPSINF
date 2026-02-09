"use client";

import React from "react";
import { DIVISION_COLORS } from "@/lib/colors";

interface ColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
    label?: string;
}

export default function ColorPicker({
    selectedColor,
    onColorChange,
    label = "Division Color",
}: ColorPickerProps) {
    return (
        <div>
            {label && (
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-5 gap-2">
                {DIVISION_COLORS.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => onColorChange(color.value)}
                        className={`h-10 w-10 rounded-md transition-all duration-200 ${selectedColor === color.value
                                ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110"
                                : "hover:scale-105"
                            }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name} color`}
                    />
                ))}
            </div>
        </div>
    );
}
