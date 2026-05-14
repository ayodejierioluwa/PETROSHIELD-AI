"use client";

import React, { useRef, useEffect } from "react";

interface Waypoint {
    segment_id: string;
    name: string;
    acoustic_amplitudes: number[];
}

interface WaterfallSpectrogramProps {
    waypoints: Waypoint[];
    selectedSegment: string | null;
}

export default function WaterfallSpectrogram({ waypoints, selectedSegment }: WaterfallSpectrogramProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<number[][]>([]);

    const activeWaypoint = waypoints.find(w => w.segment_id === selectedSegment) || waypoints[0];

    useEffect(() => {
        if (!activeWaypoint) return;

        // Push current amplitudes into history buffer (max 40 slices)
        historyRef.current.unshift([...activeWaypoint.acoustic_amplitudes]);
        if (historyRef.current.length > 40) {
            historyRef.current.pop();
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sliceHeight = canvas.height / 40;
        const binWidth = canvas.width / 10;

        historyRef.current.forEach((slice, sliceIdx) => {
            const y = sliceIdx * sliceHeight;

            slice.forEach((amp, binIdx) => {
                const x = binIdx * binWidth;

                // Color mapping: Blue (Low) -> Purple (Mid) -> Crimson/Amber (High)
                let r = 11;
                let g = 19;
                let b = 43;

                if (amp > 120) {
                    r = min(255, Math.floor(amp * 1.8));
                    g = min(150, Math.floor(amp * 0.5));
                    b = 50;
                } else if (amp > 60) {
                    r = min(200, Math.floor(amp * 1.2));
                    g = min(80, Math.floor(amp * 0.4));
                    b = 150;
                } else {
                    r = min(100, Math.floor(amp * 0.8));
                    g = min(100, Math.floor(amp * 0.8));
                    b = min(255, Math.floor(amp * 2.0));
                }

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, binWidth - 1, sliceHeight - 1);
            });
        });
    }, [activeWaypoint]);

    return (
        <div className="bg-[#0B132B]/80 backdrop-blur-md border border-[#1C2541] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#1C2541] pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    📊 Acoustic Waterfall Spectrogram
                </h3>
                <span className="text-xs bg-[#1C2541] text-gray-300 px-3 py-1 rounded-full font-mono">
                    Segment: {activeWaypoint ? activeWaypoint.name : "None"}
                </span>
            </div>

            <div className="relative w-full h-[260px] bg-[#030712] rounded-xl border border-[#1C2541] overflow-hidden flex flex-col p-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1 px-1">
                    <span>0 Hz (Mechanical / Shoveling)</span>
                    <span>500 Hz (Fluid Flow)</span>
                    <span>1000 Hz (Drill Bit Whine)</span>
                </div>

                <canvas ref={canvasRef} width={600} height={200} className="w-full h-[200px] rounded border border-[#1C2541] bg-[#030712]"></canvas>

                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1 px-1">
                    <span>▲ Current Time Slice (Top)</span>
                    <span>Waterfall History Buffer (Bottom) ▼</span>
                </div>
            </div>
        </div>
    );
}

function min(a: number, b: number): number {
    return a < b ? a : b;
}
