"use client";

import React, { useEffect, useRef } from "react";

interface Threat {
    segment_id: string;
    name: string;
    classification: string;
    confidence_pct: number;
    pressure_psi: number;
    tactical_action: string;
}

interface AIAlertCenterProps {
    overallStatus: string;
    activeThreats: Threat[];
    reportMarkdown: string;
    onPlayAudio: (type: string) => void;
    onStopAudio: () => void;
}

export default function AIAlertCenter({
    overallStatus,
    activeThreats,
    reportMarkdown,
    onPlayAudio,
    onStopAudio
}: AIAlertCenterProps) {
    const isThreat = activeThreats.length > 0;

    let badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (overallStatus === "CRITICAL_INTRUSION" || overallStatus === "ACTIVE_VANDALISM") {
        badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse";
    } else if (overallStatus === "HYDRAULIC_CONTAINMENT") {
        badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse";
    }

    return (
        <div className="bg-[#0B132B]/80 backdrop-blur-md border border-[#1C2541] rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C2541] pb-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        🧠 AI Threat Intrusion Classifier
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Autonomous Fiber-Optic Acoustic Signature Categorization</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-2 ${badgeColor}`}>
                    <span>ROUTE STATUS: {overallStatus}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Threats List */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">🚨 Active Intrusion Vectors</h4>

                    {activeThreats.length === 0 ? (
                        <div className="h-48 rounded-xl border border-[#1C2541] bg-[#030712] flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-emerald-400 text-2xl mb-2">🛡️</span>
                            <span className="text-sm font-bold text-gray-200 font-mono">No Illicit Intrusions</span>
                            <span className="text-xs text-gray-500 mt-1 font-mono">Ambient noise filtering active. All sectors secure.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-64 pr-2">
                            {activeThreats.map((t, i) => {
                                let audioType = "excavation";
                                if (t.classification.includes("Hot-Tapping")) audioType = "hot_tapping";
                                if (t.classification.includes("Corrosion")) audioType = "corrosion_leak";

                                return (
                                    <div key={i} className="rounded-xl border border-rose-500/40 bg-[#030712] p-4 flex flex-col gap-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 animate-pulse"></div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-white font-mono">{t.name}</span>
                                            <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30 font-mono">
                                                {t.confidence_pct}% CONF
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 font-mono">{t.classification}</p>
                                        
                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => onPlayAudio(audioType)}
                                                className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded transition flex items-center justify-center gap-1 font-mono"
                                            >
                                                🔊 Listen to Threat
                                            </button>
                                            <button
                                                onClick={onStopAudio}
                                                className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px] rounded transition font-mono"
                                            >
                                                ⏹️ Mute
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* AI Tactical Assessment Report */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">📜 Automated Security Appraisal Prospectus</h4>

                    <div className="h-64 rounded-xl border border-[#1C2541] bg-[#030712] p-6 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed shadow-inner">
                        {reportMarkdown.split("\n\n").map((block, i) => {
                            if (block.startsWith("# ")) {
                                return <h1 key={i} className="text-lg font-bold text-white mb-3 border-b border-gray-800 pb-2">{block.replace("# ", "")}</h1>;
                            } else if (block.startsWith("## ")) {
                                return <h2 key={i} className="text-sm font-bold text-gray-200 mt-4 mb-2">{block.replace("## ", "")}</h2>;
                            } else if (block.startsWith("### ")) {
                                const isAlert = block.includes("Threat Alert");
                                return <h3 key={i} className={`text-xs font-bold mt-3 mb-1 ${isAlert ? 'text-rose-400' : 'text-emerald-400'}`}>{block.replace("### ", "")}</h3>;
                            } else if (block.startsWith("#### ")) {
                                return <h4 key={i} className="text-xs font-bold text-amber-300 mt-3 mb-1">{block.replace("#### ", "")}</h4>;
                            } else if (block.startsWith("* ")) {
                                return (
                                    <ul key={i} className="list-disc list-inside space-y-1 my-1 pl-2 text-gray-400">
                                        {block.split("\n").map((li, idx) => (
                                            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(li.replace("* ", "")) }}></li>
                                        ))}
                                    </ul>
                                );
                            } else {
                                return <p key={i} className="my-2 text-gray-400" dangerouslySetInnerHTML={{ __html: formatInline(block) }}></p>;
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatInline(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-white">$1</span>')
        .replace(/`(.*?)`/g, '<span class="bg-[#1C2541] text-amber-300 px-1 py-0.5 rounded font-mono font-bold">$1</span>')
        .replace(/\*(.*?)\*/g, '<span class="italic text-gray-300">$1</span>');
}
