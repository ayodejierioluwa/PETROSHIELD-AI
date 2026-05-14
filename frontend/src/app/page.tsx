"use client";

import React, { useState, useEffect, useRef } from "react";
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
    const [waypoints, setWaypoints] = useState<Waypoint[]>([
        { segment_id: "SEG-001", name: "Escravos Terminal Manifold", lat: 5.584, lng: 5.248, pressure_psi: 85.0, acoustic_amplitudes: [10,20,30,40,50,60,50,40,30,20], status: "Nominal", active_anomaly: "none" },
        { segment_id: "SEG-002", name: "Forcados River Crossing", lat: 5.362, lng: 5.412, pressure_psi: 82.5, acoustic_amplitudes: [15,25,35,45,55,65,55,45,35,25], status: "Nominal", active_anomaly: "none" },
        { segment_id: "SEG-003", name: "Nembe Creek Trunkline (NCTL)", lat: 4.521, lng: 6.415, pressure_psi: 78.0, acoustic_amplitudes: [12,22,32,42,52,62,52,42,32,22], status: "Nominal", active_anomaly: "none" },
        { segment_id: "SEG-004", name: "Rambler Swamp Flowstation", lat: 4.815, lng: 6.021, pressure_psi: 74.2, acoustic_amplitudes: [14,24,34,44,54,64,54,44,34,24], status: "Nominal", active_anomaly: "none" },
        { segment_id: "SEG-005", name: "Bonny Export Terminal Depot", lat: 4.431, lng: 7.152, pressure_psi: 70.0, acoustic_amplitudes: [11,21,31,41,51,61,51,41,31,21], status: "Nominal", active_anomaly: "none" }
    ]);
    const [analysis, setAnalysis] = useState<ThreatAnalysis>({
        overall_status: "VIGILANT",
        active_threats: [],
        highest_threat_score: 0.0,
        report_markdown: ""
    });
    const [selectedSegment, setSelectedSegment] = useState<string>("SEG-002");
    const [activeTab, setActiveTab] = useState<string>("MAP_VIEW");
    const [logs, setLogs] = useState<string[]>([
        "[14:22:01] > INITIALIZING DEEP PACKET ACOUSTIC INSPECTION... OK",
        "[14:22:04] > SYSTEM HEALTH SWEEP COMPLETED ACROSS 5 MANIFOLDS... SECURE",
        "[14:22:06] > FILTERING AMBIENT NOISE: TROPICAL RAINSTORM PROFILE ISOLATED",
        "[14:22:09] > OPTICAL TIME-DOMAIN REFLECTOMETRY (OTDR) LASER PULSE AT 10kHz"
    ]);
    
    const audioSynthRef = useRef<ThreatAudioPlayback | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<number[][]>([]);

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
            // Backend offline
        }
    };

    const fetchAnalysis = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/threats/analyze");
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);

                if (data.active_threats && data.active_threats.length > 0) {
                    const newLog = `[${new Date().toLocaleTimeString()}] > ALERT: ${data.active_threats[0].classification.toUpperCase()} (CONFIDENCE ${data.active_threats[0].confidence_pct}%)`;
                    setLogs(prev => [newLog, ...prev.slice(0, 8)]);
                }
            }
        } catch (e) {
            // Backend offline
        }
    };

    useEffect(() => {
        fetchTelemetry();
        fetchAnalysis();

        const interval = setInterval(() => {
            fetchTelemetry();
            fetchAnalysis();
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    // Waterfall Spectrogram Canvas Rendering
    const activeWaypoint = waypoints.find(w => w.segment_id === selectedSegment) || waypoints[0];
    useEffect(() => {
        if (!activeWaypoint) return;

        historyRef.current.unshift([...activeWaypoint.acoustic_amplitudes]);
        if (historyRef.current.length > 30) {
            historyRef.current.pop();
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sliceHeight = canvas.height / 30;
        const binWidth = canvas.width / 10;

        historyRef.current.forEach((slice, sliceIdx) => {
            const y = sliceIdx * sliceHeight;
            slice.forEach((amp, binIdx) => {
                const x = binIdx * binWidth;
                let fill = "#4edea3"; // tertiary
                if (amp > 100) fill = "#ffb4ab"; // error
                else if (amp > 50) fill = "#ffb2b7"; // secondary
                else if (amp > 30) fill = "#adc6ff"; // primary
                else fill = "#131a33";

                ctx.fillStyle = fill;
                ctx.fillRect(x, y, binWidth - 1, sliceHeight - 1);
            });
        });
    }, [activeWaypoint]);

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

            const actionName = anomalyType === 'excavation' ? 'MECHANICAL_EXCAVATION' : anomalyType === 'hot_tapping' ? 'ILLICIT_HOT_TAPPING' : 'CORROSION_LEAK';
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] > ANOMALY INJECTED: ${actionName} AT ${segmentId}`, ...prev]);

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
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] > SYSTEM BASELINE RESTORED. ALL MANIFOLDS NOMINAL.`, ...prev]);

            if (audioSynthRef.current) {
                audioSynthRef.current.stop();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePlayAudio = () => {
        if (audioSynthRef.current) {
            const activeAnomaly = activeWaypoint ? activeWaypoint.active_anomaly : 'excavation';
            audioSynthRef.current.playThreat(activeAnomaly === 'none' ? 'excavation' : activeAnomaly);
        }
    };

    const handleStopAudio = () => {
        if (audioSynthRef.current) {
            audioSynthRef.current.stop();
        }
    };

    return (
        <div className="bg-[#0a122a] text-[#dbe1ff] min-h-screen font-sans cyber-grid overflow-hidden flex flex-col relative">
            <div className="scan-line fixed inset-0 z-50 pointer-events-none"></div>

            {/* Top Navigation */}
            <header className="w-full h-16 sticky top-0 bg-[#0a122a]/70 backdrop-blur-xl border-b border-[#424754]/30 flex justify-between items-center px-6 z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <h1 className="font-label-caps text-[11px] tracking-widest text-[#adc6ff]">PIPELINE SEC-OPS</h1>
                    <nav className="hidden md:flex gap-4">
                        <span className="font-data-mono text-[14px] text-[#adc6ff] border-b-2 border-[#adc6ff] py-1 px-2 cursor-pointer transition-all">SYS_HEALTH</span>
                        <span className="font-data-mono text-[14px] text-[#c2c6d6] hover:bg-[#adc6ff]/10 py-1 px-2 cursor-pointer transition-all">NODE_STAT</span>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleTriggerAnomaly("excavation", "SEG-003")}
                            className="bg-[#b50036] text-[#ffc2c4] px-3 py-1.5 font-label-caps text-[10px] rounded cursor-pointer hover:bg-[#ffb2b7] hover:text-[#67001b] transition-colors"
                        >
                            ⚡ EXCAVATION (NCTL)
                        </button>
                        <button 
                            onClick={() => handleTriggerAnomaly("hot_tapping", "SEG-002")}
                            className="bg-[#005ac2] text-[#dbe1ff] px-3 py-1.5 font-label-caps text-[10px] rounded cursor-pointer hover:bg-[#4d8eff] transition-colors"
                        >
                            ⚡ HOT-TAPPING (FORCADOS)
                        </button>
                        <button 
                            onClick={() => handleTriggerAnomaly("corrosion_leak", "SEG-004")}
                            className="bg-[#00a572] text-[#00311f] px-3 py-1.5 font-label-caps text-[10px] rounded cursor-pointer hover:bg-[#4edea3] transition-colors"
                        >
                            ⚡ LEAK (RAMBLER)
                        </button>
                        <button 
                            onClick={handleResetAnomaly}
                            className="bg-[#2c344d] text-[#dbe1ff] px-3 py-1.5 font-label-caps text-[10px] rounded cursor-pointer hover:bg-[#424754] transition-colors"
                        >
                            🔄 RESTORE
                        </button>
                    </div>

                    <div className="flex gap-4 text-[#c2c6d6] items-center ml-2">
                        <span className="material-symbols-outlined cursor-pointer hover:text-[#adc6ff] transition-colors">notifications_active</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-[#adc6ff] transition-colors">settings</span>
                        <div className="w-8 h-8 rounded-full border border-[#adc6ff]/30 overflow-hidden bg-gradient-to-tr from-[#adc6ff] to-[#b50036]"></div>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar */}
                <aside className="h-full w-64 bg-[#131a33]/70 backdrop-blur-xl border-r border-[#424754]/30 flex flex-col py-6 z-30 shrink-0">
                    <div className="px-6 mb-8">
                        <h2 className="text-2xl font-bold text-[#adc6ff] font-sans">SECTOR_G12</h2>
                        <p className="font-data-mono text-[10px] text-[#4edea3]">STATUS: {analysis.overall_status}</p>
                    </div>

                    <nav className="flex-1 flex flex-col gap-1">
                        <div 
                            onClick={() => setActiveTab("MAP_VIEW")}
                            className={`border-l-4 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${activeTab === 'MAP_VIEW' ? 'bg-[#b50036] text-[#ffc2c4] border-[#ffb2b7]' : 'text-[#c2c6d6] hover:bg-[#2c344d]/50 border-transparent'}`}
                        >
                            <span className="material-symbols-outlined">map</span>
                            <span className="font-data-mono text-[14px]">MAP_VIEW</span>
                        </div>
                        <div 
                            onClick={() => setActiveTab("ACOUSTIC_GRID")}
                            className={`border-l-4 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${activeTab === 'ACOUSTIC_GRID' ? 'bg-[#b50036] text-[#ffc2c4] border-[#ffb2b7]' : 'text-[#c2c6d6] hover:bg-[#2c344d]/50 border-transparent'}`}
                        >
                            <span className="material-symbols-outlined">graphic_eq</span>
                            <span className="font-data-mono text-[14px]">ACOUSTIC_GRID</span>
                        </div>
                        <div 
                            onClick={() => setActiveTab("THREAT_LOGS")}
                            className={`border-l-4 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${activeTab === 'THREAT_LOGS' ? 'bg-[#b50036] text-[#ffc2c4] border-[#ffb2b7]' : 'text-[#c2c6d6] hover:bg-[#2c344d]/50 border-transparent'}`}
                        >
                            <span className="material-symbols-outlined">security</span>
                            <span className="font-data-mono text-[14px]">THREAT_LOGS</span>
                        </div>
                        <div 
                            onClick={() => setActiveTab("SENSORS")}
                            className={`border-l-4 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${activeTab === 'SENSORS' ? 'bg-[#b50036] text-[#ffc2c4] border-[#ffb2b7]' : 'text-[#c2c6d6] hover:bg-[#2c344d]/50 border-transparent'}`}
                        >
                            <span className="material-symbols-outlined">sensors</span>
                            <span className="font-data-mono text-[14px]">SENSORS</span>
                        </div>
                    </nav>

                    <div className="px-6 py-4">
                        <button 
                            onClick={() => fetchAnalysis()}
                            className="w-full bg-[#adc6ff]/20 border border-[#adc6ff] text-[#adc6ff] py-2 font-label-caps text-[11px] rounded hover:bg-[#adc6ff] hover:text-[#002e6a] transition-all"
                        >
                            INITIATE_SWEEP
                        </button>
                    </div>

                    <div className="px-6 mt-auto flex flex-col gap-2 opacity-60">
                        <div className="flex items-center gap-4 py-2 hover:text-[#adc6ff] cursor-pointer transition-all">
                            <span className="material-symbols-outlined">help</span>
                            <span className="font-data-mono text-[14px]">SUPPORT</span>
                        </div>
                        <div className="flex items-center gap-4 py-2 hover:text-[#adc6ff] cursor-pointer transition-all">
                            <span className="material-symbols-outlined">history</span>
                            <span className="font-data-mono text-[14px]">ARCHIVE</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6 custom-scrollbar">
                    {/* Left Column: Map & Spectrogram */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        {/* Tactical Map */}
                        <section className="glass-panel bg-[#131a33]/50 rounded-lg p-6 relative min-h-[380px] flex flex-col justify-between">
                            <div className="flex justify-between items-center z-10 mb-4 border-b border-[#424754]/30 pb-3">
                                <div>
                                    <h3 className="font-label-caps text-[11px] text-[#adc6ff]">NIGER DELTA EXPORT TRUNKLINE (DAS ARRAY)</h3>
                                    <p className="text-xs text-gray-400 mt-1">100km Monitored Fiber-Optic Route (Escravos to Bonny)</p>
                                </div>
                                <span className="font-label-caps text-[10px] text-[#c2c6d6] bg-[#2c344d] px-2 py-1 rounded border border-[#424754]">
                                    ID: GEOSPATIAL_01_SEC
                                </span>
                            </div>

                            <div className="w-full h-64 bg-[#050d25] relative overflow-hidden rounded-lg border border-[#424754]/50 flex items-center justify-between p-8">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #adc6ff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
                                
                                {/* Connecting Pipeline Line */}
                                <div className="absolute left-12 right-12 h-1 bg-[#adc6ff]/40 top-1/2 -translate-y-1/2 z-0 border-dashed border-t border-[#adc6ff]"></div>

                                {waypoints.map((wp, idx) => {
                                    const isAlert = wp.status !== 'Nominal';
                                    const isSelected = selectedSegment === wp.segment_id;
                                    let circleColor = "#00a572"; // green
                                    if (wp.status === "Intrusion_Warning") circleColor = "#ffb4ab"; // amber/error
                                    else if (wp.status === "Active_Tapping" || wp.status === "Pressure_Leak") circleColor = "#b50036"; // red

                                    return (
                                        <div key={wp.segment_id} className="relative flex flex-col items-center z-10 group">
                                            <button 
                                                onClick={() => setSelectedSegment(wp.segment_id)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isSelected ? 'scale-125 ring-4 ring-[#adc6ff]' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: circleColor, boxShadow: `0 0 15px ${circleColor}` }}
                                            >
                                                <span className="text-[10px] font-mono font-bold text-white">0{idx+1}</span>
                                            </button>
                                            <div className="absolute top-10 flex flex-col items-center text-center w-32 pointer-events-none">
                                                <span className={`text-[11px] font-mono font-bold ${isAlert ? 'text-[#ffb4ab]' : 'text-[#dbe1ff]'}`}>{wp.name.split(" ")[0]}</span>
                                                <span className="text-[10px] font-mono text-[#4edea3]">{wp.pressure_psi} PSI</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-6 mt-4 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00a572]"></div>
                                    <span className="font-data-mono text-[11px] text-[#c2c6d6]">NOMINAL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></div>
                                    <span className="font-data-mono text-[11px] text-[#c2c6d6]">ALERT</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#b50036]"></div>
                                    <span className="font-data-mono text-[11px] text-[#c2c6d6]">CRITICAL</span>
                                </div>
                            </div>
                        </section>

                        {/* Acoustic Spectrogram */}
                        <section className="glass-panel bg-[#131a33]/50 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-label-caps text-[11px] text-[#adc6ff]">ACOUSTIC WATERFALL SPECTROGRAM</h3>
                                <span className="font-data-mono text-[10px] text-[#c2c6d6]">RANGE: 0Hz - 1000Hz ({activeWaypoint ? activeWaypoint.name : 'None'})</span>
                            </div>

                            <div className="w-full h-40 bg-[#050d25] relative overflow-hidden rounded border border-[#424754]/50 p-2 flex flex-col">
                                <canvas ref={canvasRef} width={600} height={140} className="w-full h-32 bg-[#050d25]"></canvas>
                                <div className="flex justify-between mt-2 font-data-mono text-[10px] text-[#8c909f]">
                                    <span>0Hz (Digging)</span>
                                    <span>250Hz</span>
                                    <span>500Hz (Flow)</span>
                                    <span>750Hz</span>
                                    <span>1000Hz (Drill Whine)</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: AI Threat Classifier */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="glass-panel bg-[#131a33]/50 rounded-lg p-6 flex flex-col h-full max-h-[550px] justify-between">
                            <div className="flex justify-between items-start mb-6 border-b border-[#424754]/30 pb-3">
                                <div>
                                    <h3 className="font-label-caps text-[11px] text-[#adc6ff]">AI THREAT INTRUSION CLASSIFIER</h3>
                                    <p className="font-data-mono text-[10px] text-[#c2c6d6] mt-0.5">ACTIVE INFERENCE ENGINE v4.2</p>
                                </div>
                                <span className="font-label-caps text-[10px] text-[#ffb4ab] border border-[#ffb4ab] px-2 py-0.5 rounded">
                                    {analysis.active_threats.length > 0 ? "THREAT_DETECTED" : "ALL_SECURE"}
                                </span>
                            </div>

                            <div className="space-y-4 flex-1">
                                {/* Classification Rows */}
                                <div className="bg-[#2c344d]/30 border border-[#424754]/50 p-4 rounded">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-data-mono text-[13px] text-[#dbe1ff]">MECHANICAL_DIGGING</span>
                                        <span className="font-data-mono text-[13px] text-[#ffb2b7] font-bold">
                                            {analysis.active_threats.length > 0 && analysis.active_threats[0].classification.includes("Digging") ? "98.4%" : "12.4%"}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-[#050d25] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#ffb2b7] shadow-[0_0_8px_rgba(255,178,183,0.4)] transition-all duration-500" style={{ width: analysis.active_threats.length > 0 && analysis.active_threats[0].classification.includes("Digging") ? "98.4%" : "12.4%" }}></div>
                                    </div>
                                </div>

                                <div className="bg-[#2c344d]/10 border border-[#424754]/30 p-4 rounded">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-data-mono text-[13px] text-[#dbe1ff]">ILLICIT_HOT_TAPPING</span>
                                        <span className="font-data-mono text-[13px] text-[#4edea3] font-bold">
                                            {analysis.active_threats.length > 0 && analysis.active_threats[0].classification.includes("Tapping") ? "99.4%" : "04.1%"}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-[#050d25] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4edea3] transition-all duration-500" style={{ width: analysis.active_threats.length > 0 && analysis.active_threats[0].classification.includes("Tapping") ? "99.4%" : "4.1%" }}></div>
                                    </div>
                                </div>

                                <div className="bg-[#2c344d]/10 border border-[#424754]/30 p-4 rounded">
                                    <div className="flex justify-between mb-2 opacity-60">
                                        <span className="font-data-mono text-[13px] text-[#dbe1ff]">HEAVY_VEHICLE_TRANSIT</span>
                                        <span className="font-data-mono text-[13px] text-[#c2c6d6]">12.1%</span>
                                    </div>
                                    <div className="h-2 w-full bg-[#050d25] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4edea3]/40" style={{ width: "12.1%" }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-[#424754]/30">
                                <button 
                                    onClick={handlePlayAudio}
                                    className="w-full bg-[#adc6ff] text-[#002e6a] py-3 font-label-caps text-[11px] rounded flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all cursor-pointer font-bold shadow-lg"
                                >
                                    <span className="material-symbols-outlined">volume_up</span>
                                    LISTEN TO THREAT
                                </button>
                                <button 
                                    onClick={handleStopAudio}
                                    className="w-full bg-transparent border border-[#424754] text-[#c2c6d6] py-2 font-label-caps text-[11px] rounded hover:bg-[#424754]/20 transition-all cursor-pointer"
                                >
                                    MUTE FEED
                                </button>
                            </div>
                        </section>

                        {/* Signal Image Placeholder */}
                        <div className="glass-panel bg-[#050d25] h-32 rounded-lg overflow-hidden group border border-[#424754]/30 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#005ac2]/20 to-[#b50036]/20 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                            <span className="font-data-mono text-xs text-[#adc6ff] z-10 font-mono flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping"></span>
                                OPTICAL FIBER INTERROGATOR LIVE
                            </span>
                        </div>
                    </div>

                    {/* Terminal Log: Bottom */}
                    <section className="col-span-12 glass-panel bg-[#131a33]/80 rounded-lg p-6 h-48 flex flex-col border border-[#424754]/40">
                        <div className="flex items-center gap-4 mb-3 border-b border-[#424754]/30 pb-3">
                            <h3 className="font-label-caps text-[11px] text-[#4edea3] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                                AUTONOMOUS SECURITY APPRAISAL LOG
                            </h3>
                            <div className="flex-1 h-[1px] bg-[#424754]/30"></div>
                            <span className="font-data-mono text-[10px] text-[#8c909f]">ST_01.LOG_0942</span>
                        </div>

                        <div className="flex-1 font-data-mono text-[13px] text-[#4edea3] overflow-y-auto space-y-1.5 custom-scrollbar pr-2">
                            {logs.map((lg, idx) => {
                                let colorClass = "text-[#4edea3]";
                                if (lg.includes("ALERT") || lg.includes("CRITICAL")) colorClass = "text-[#ffb4ab] font-bold";
                                else if (lg.includes("ANOMALY")) colorClass = "text-[#ffb2b7]";

                                return <p key={idx} className={colorClass}>{lg}</p>;
                            })}
                        </div>
                    </section>
                </div>
            </main>

            {/* Floating UI elements */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <button className="w-12 h-12 bg-[#ffb2b7] text-[#67001b] rounded-lg flex items-center justify-center shadow-lg hover:rotate-90 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined">warning</span>
                </button>
            </div>
        </div>
    );
}
