"use client";

import React, { useState, useEffect, useRef } from "react";
import TacticalMap from "../components/TacticalMap";
import WaterfallSpectrogram from "../components/WaterfallSpectrogram";
import AIAlertCenter from "../components/AIAlertCenter";
import { ThreatAudioPlayback } from "../utils/ThreatAudioPlayback";

interface Waypoint {
    segment_id: string;
    name: string;
    lat: number;
    lng: number;
    pressure_psi: number;
    acoustic_amplitudes: number[];
    status: string;
    active_anomaly: string;
}

interface Threat {
    segment_id: string;
    name: string;
    classification: string;
    confidence_pct: number;
    pressure_psi: number;
    tactical_action: string;
}

interface ThreatAnalysis {
    overall_status: string;
    active_threats: Threat[];
    highest_threat_score: number;
    report_markdown: string;
}

export default function Home() {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [analysis, setAnalysis] = useState<ThreatAnalysis>({
        overall_status: "SECURE",
        active_threats: [],
        highest_threat_score: 0.0,
        report_markdown: "# Loading Security Assessment...\nFetching fiber-optic DAS arrays."
    });
    const [selectedSegment, setSelectedSegment] = useState<string | null>("SEG-002");
    
    const audioSynthRef = useRef<ThreatAudioPlayback | null>(null);

    useEffect(() => {
        audioSynthRef.current = new ThreatAudioPlayback();
        return () => {
            if (audioSynthRef.current) {
                audioSynthRef.current.stop();
            }
        };
    }, []);

    const fetchTelemetry = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/sensors/telemetry");
            if (res.ok) {
                const data = await res.json();
                setWaypoints(data);
            }
        } catch (e) {
            // Backend offline / loading
        }
    };

    const fetchAnalysis = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/threats/analyze");
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
            }
        } catch (e) {
            // Backend offline / loading
        }
    };

    useEffect(() => {
        fetchTelemetry();
        fetchAnalysis();

        // Live polling every 1.5 seconds to simulate high-frequency fiber-optic sweeps
        const interval = setInterval(() => {
            fetchTelemetry();
            fetchAnalysis();
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const handleTriggerAnomaly = async (anomalyType: string, segmentId: string) => {
        try {
            await fetch("http://localhost:8002/api/sensors/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ anomaly_type: anomalyType, segment_id: segmentId })
            });
            setSelectedSegment(segmentId);
            fetchTelemetry();
            fetchAnalysis();

            if (audioSynthRef.current) {
                audioSynthRef.current.playThreat(anomalyType);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleResetAnomaly = async () => {
        try {
            await fetch("http://localhost:8002/api/sensors/reset", { method: "POST" });
            fetchTelemetry();
            fetchAnalysis();

            if (audioSynthRef.current) {
                audioSynthRef.current.stop();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePlayAudio = (type: string) => {
        if (audioSynthRef.current) {
            audioSynthRef.current.playThreat(type);
        }
    };

    const handleStopAudio = () => {
        if (audioSynthRef.current) {
            audioSynthRef.current.stop();
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-[#F3F4F6] p-4 md:p-8 flex flex-col gap-8 relative overflow-x-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Tactical Suite Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0B132B]/80 backdrop-blur-md border border-[#1C2541] rounded-2xl p-6 shadow-2xl relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
                        <span className="text-2xl">🛡️</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                PETROONE OPERATIONS SUITE
                            </span>
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                REAL-TIME TACTICAL CORE
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1 tracking-tight">
                            PetroShield<span className="text-rose-500">-AI</span>
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            AI-Driven Pipeline Anti-Vandalism & Intrusion Security Platform (DAS Sensor Fusion)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[#030712] border border-[#1C2541] rounded-xl p-3 px-5">
                    <div className="flex flex-col items-end font-mono">
                        <span className="text-[10px] text-gray-500">SYSTEM ARCHITECTURE</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            FFT SPECTRA LIVE (10kHz)
                        </span>
                    </div>
                </div>
            </header>

            {/* Core Interactive Layout */}
            <div className="grid grid-cols-1 gap-8 relative z-10">
                {/* 1. Tactical Route Map */}
                <TacticalMap
                    waypoints={waypoints}
                    selectedSegment={selectedSegment}
                    onSelectSegment={setSelectedSegment}
                    onTriggerAnomaly={handleTriggerAnomaly}
                    onResetAnomaly={handleResetAnomaly}
                />

                {/* 2. Scrolling Acoustic Waterfall */}
                <WaterfallSpectrogram
                    waypoints={waypoints}
                    selectedSegment={selectedSegment}
                />

                {/* 3. AI Intrusion Classifier Log & Report */}
                <AIAlertCenter
                    overallStatus={analysis.overall_status}
                    activeThreats={analysis.active_threats}
                    reportMarkdown={analysis.report_markdown}
                    onPlayAudio={handlePlayAudio}
                    onStopAudio={handleStopAudio}
                />
            </div>
        </main>
    );
}
