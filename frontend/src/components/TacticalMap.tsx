"use client";

import React from "react";

interface Waypoint {
    segment_id: string;
    name: string;
    lat: number;
    lng: number;
    pressure_psi: number;
    status: string;
    active_anomaly: string;
}

interface TacticalMapProps {
    waypoints: Waypoint[];
    selectedSegment: string | null;
    onSelectSegment: (id: string) => void;
    onTriggerAnomaly: (type: string, id: string) => void;
    onResetAnomaly: () => void;
}

export default function TacticalMap({
    waypoints,
    selectedSegment,
    onSelectSegment,
    onTriggerAnomaly,
    onResetAnomaly
}: TacticalMapProps) {
    return (
        <div className="bg-[#0B132B]/80 backdrop-blur-md border border-[#1C2541] rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C2541] pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        Niger Delta Export Trunkline (DAS Array)
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">100km Monitored Fiber-Optic Distributed Acoustic Sensing Route</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => onTriggerAnomaly("excavation", "SEG-003")}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs rounded-lg transition"
                    >
                        ⚡ Simulate Excavation (NCTL)
                    </button>
                    <button
                        onClick={() => onTriggerAnomaly("hot_tapping", "SEG-002")}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs rounded-lg transition"
                    >
                        ⚡ Simulate Hot-Tapping (Forcados)
                    </button>
                    <button
                        onClick={() => onTriggerAnomaly("corrosion_leak", "SEG-004")}
                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 text-xs rounded-lg transition"
                    >
                        ⚡ Simulate Leak (Rambler)
                    </button>
                    <button
                        onClick={onResetAnomaly}
                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white text-xs rounded-lg transition"
                    >
                        🔄 Restore Baseline
                    </button>
                </div>
            </div>

            {/* Simulated Tactical Map Grid */}
            <div className="relative w-full h-[280px] bg-[#030712] rounded-xl border border-[#1C2541] overflow-hidden flex flex-col justify-between p-4">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C2541_1px,transparent_1px),linear-gradient(to_bottom,#1C2541_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono z-10">
                    <span>NW: 5.82°N, 5.10°E</span>
                    <span>PIPELINE ROUTE: ESCRAVOS TO BONNY</span>
                    <span>SE: 4.30°N, 7.30°E</span>
                </div>

                {/* Pipeline Segments Rendering */}
                <div className="relative w-full h-32 my-auto flex items-center justify-between px-8 z-10">
                    {/* Connecting Line */}
                    <div className="absolute left-12 right-12 h-1.5 bg-[#1C2541] top-1/2 -translate-y-1/2 z-0"></div>

                    {waypoints.map((wp) => {
                        const isSelected = selectedSegment === wp.segment_id;
                        let statusColor = "bg-emerald-500 border-emerald-400";
                        let ringColor = "ring-emerald-500/30";
                        if (wp.status === "Intrusion_Warning") {
                            statusColor = "bg-amber-500 border-amber-400 animate-pulse";
                            ringColor = "ring-amber-500/50 animate-ping";
                        } else if (wp.status === "Active_Tapping" || wp.status === "Pressure_Leak") {
                            statusColor = "bg-rose-500 border-rose-400 animate-pulse";
                            ringColor = "ring-rose-500/50 animate-ping";
                        }

                        return (
                            <div key={wp.segment_id} className="relative flex flex-col items-center group z-10">
                                <button
                                    onClick={() => onSelectSegment(wp.segment_id)}
                                    className={`w-8 h-8 rounded-full border-2 ${statusColor} shadow-lg ring-4 ${ringColor} flex items-center justify-center transition-all ${isSelected ? 'scale-125 ring-8' : 'hover:scale-110'}`}
                                >
                                    <span className="text-[10px] font-bold text-white font-mono">{wp.segment_id.replace("SEG-0", "")}</span>
                                </button>

                                <div className="absolute top-10 flex flex-col items-center text-center w-32 pointer-events-none">
                                    <span className={`text-xs font-bold ${wp.status !== 'Nominal' ? 'text-rose-400' : 'text-gray-200'}`}>{wp.name}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{wp.pressure_psi} PSI</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono z-10">
                    <span>FIBER-OPTIC SENSING: DAS FREQ (0-1000Hz)</span>
                    <span>SAMPLING RATE: 10kHz</span>
                </div>
            </div>
        </div>
    );
}
