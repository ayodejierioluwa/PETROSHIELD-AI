"use client";

import React, { useState, useEffect, useRef } from "react";
import { ThreatAudioPlayback } from "../utils/ThreatAudioPlayback";

export default function Home() {
    const [isElevated, setIsElevated] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([
        "[14:22:01] > INITIALIZING DEEP PACKET ACOUSTIC INSPECTION... OK",
        "[14:22:04] > ANOMALY DETECTED AT COORD 6.341N, 5.612E (SECTOR G12-SEC-42)",
        "[14:22:06] > ALERT: FREQUENCY SIGNATURE MATCHES HYDRAULIC EXCAVATOR_V2 (CONFIDENCE 0.984)",
        "[14:22:07] > CALCULATING PROXIMITY TO PIPELINE AXIS... DISTANCE: 1.2M (CRITICAL_VIOLATION)",
        "[14:22:09] > DEPLOYING DRONE_SIG_ALPHA FROM BONNY HUB... EN ROUTE (ETA: 4M 12S)",
        "[14:22:12] > CONTINUOUS MONITORING ACTIVE. BROADCASTING DETERRENT SIGNAL_09..."
    ]);

    const audioSynthRef = useRef<ThreatAudioPlayback | null>(null);

    useEffect(() => {
        audioSynthRef.current = new ThreatAudioPlayback();
        return () => {
            if (audioSynthRef.current) {
                audioSynthRef.current.stop();
            }
        };
    }, []);

    const handleElevateAlert = () => {
        const nextState = !isElevated;
        setIsElevated(nextState);

        if (nextState) {
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] > ALERT: INTRUSION SIGNATURE DETECTED (CONFIDENCE 0.984)`, ...prev]);
            if (audioSynthRef.current) {
                audioSynthRef.current.playThreat("excavation");
            }
        } else {
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] > SECTOR G12 SECURE. RESTORING BASELINE FREQUENCY PROFILE...`, ...prev]);
            if (audioSynthRef.current) {
                audioSynthRef.current.stop();
            }
        }
    };

    const handleInitiateSweep = () => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] > INITIATING OPTICAL FIBER OTDR SWEEP... ALL NODES VIGILANT`, ...prev]);
    };

    const handleListenThreat = () => {
        if (audioSynthRef.current) {
            audioSynthRef.current.playThreat("excavation");
        }
    };

    const handleMuteFeed = () => {
        if (audioSynthRef.current) {
            audioSynthRef.current.stop();
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen font-body-md cyber-grid overflow-hidden flex flex-col relative">
            <div className="scan-line fixed inset-0 z-50 pointer-events-none"></div>

            {/* Top Navigation */}
            <header className="w-full h-16 sticky top-0 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-margin z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <h1 className="font-label-caps text-label-caps tracking-widest text-primary">PIPELINE SEC-OPS</h1>
                    <nav className="hidden md:flex gap-4">
                        <a className="font-data-mono text-data-mono text-primary border-b-2 border-primary py-1 px-2 cursor-pointer active:scale-95 transition-all" href="#">SYS_HEALTH</a>
                        <a className="font-data-mono text-data-mono text-on-surface-variant hover:bg-primary/10 py-1 px-2 cursor-pointer active:scale-95 transition-all" href="#">NODE_STAT</a>
                    </nav>
                </div>
                <div className="flex items-center gap-gutter">
                    <div className="relative group">
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface-container-lowest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-data-mono text-data-mono text-on-surface py-1 w-48 transition-all" 
                            placeholder="SEC_SCAN_001..." 
                            type="text"
                        />
                    </div>
                    <button 
                        onClick={handleElevateAlert}
                        className="bg-secondary-container text-on-secondary-container px-4 py-2 font-label-caps text-label-caps cursor-pointer hover:bg-secondary transition-colors"
                    >
                        {isElevated ? "MUTE_ALERT" : "ELEVATE_ALERT"}
                    </button>
                    <div className="flex gap-4 text-on-surface-variant items-center">
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications_active</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">settings</span>
                        <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden">
                            <img alt="OPERATOR_SIG_04" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkRq8yHxaU4zxxY0-xHB7qDTABuDXXIgaYuZgx1uNzCRIeBAuscf-OtU34RYjw0P1wpUEMvGgHus3aBj1CfmVtljuywGf6U2VdMvYdXAGITp_Lcyb5nIvi813lvN-fHQdLeWgmyijyyxUG6FjueCUOl4hA3BmGJhQXx4734UNlVpaF2JYwGSrP4L0bj3UvAkMFghWDfJ_Qhlj4pohYd_dU_lmJ5E57auijN9o3Kl5LOhBFIdPhxop_w3UWiOMqHY59ZBhReROUnjo"/>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar */}
                <aside className="h-full w-64 bg-surface-container-low/70 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col py-margin z-30 shrink-0">
                    <div className="px-6 mb-8">
                        <h2 className="font-headline-md text-headline-md text-primary">SECTOR_G12</h2>
                        <p className="font-data-mono text-[10px] text-tertiary">STATUS: VIGILANT</p>
                    </div>
                    <nav className="flex-1 flex flex-col gap-1">
                        <div className="bg-secondary-container text-on-secondary-container border-l-4 border-secondary flex items-center gap-4 px-6 py-3 cursor-pointer transition-all">
                            <span className="material-symbols-outlined">map</span>
                            <span className="font-data-mono text-data-mono">MAP_VIEW</span>
                        </div>
                        <div className="text-on-surface-variant hover:bg-surface-variant/50 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all">
                            <span className="material-symbols-outlined">graphic_eq</span>
                            <span className="font-data-mono text-data-mono">ACOUSTIC_GRID</span>
                        </div>
                        <div className="text-on-surface-variant hover:bg-surface-variant/50 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all">
                            <span className="material-symbols-outlined">security</span>
                            <span className="font-data-mono text-data-mono">THREAT_LOGS</span>
                        </div>
                        <div className="text-on-surface-variant hover:bg-surface-variant/50 flex items-center gap-4 px-6 py-3 cursor-pointer transition-all">
                            <span className="material-symbols-outlined">sensors</span>
                            <span className="font-data-mono text-data-mono">SENSORS</span>
                        </div>
                    </nav>
                    <div className="px-6 py-4">
                        <button 
                            onClick={handleInitiateSweep}
                            className="w-full bg-primary/20 border border-primary text-primary py-2 font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                        >
                            INITIATE_SWEEP
                        </button>
                    </div>
                    <div className="px-6 mt-auto flex flex-col gap-2 opacity-60">
                        <div className="flex items-center gap-4 py-2 hover:text-primary cursor-pointer transition-all">
                            <span className="material-symbols-outlined">help</span>
                            <span className="font-data-mono text-data-mono">SUPPORT</span>
                        </div>
                        <div className="flex items-center gap-4 py-2 hover:text-primary cursor-pointer transition-all">
                            <span className="material-symbols-outlined">history</span>
                            <span className="font-data-mono text-data-mono">ARCHIVE</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-margin grid grid-cols-12 gap-gutter custom-scrollbar">
                    {/* Left Column: Map & Spectrogram */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
                        {/* Tactical Map */}
                        <section className="glass-panel bg-surface-container-low/50 rounded-lg p-unit relative min-h-[400px]">
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <span className="font-label-caps text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-1 border border-outline-variant/30">ID: GEOSPATIAL_01_SEC</span>
                            </div>
                            <div className="w-full h-full min-h-[400px] bg-surface-container-lowest relative overflow-hidden rounded">
                                {/* Simulated Map Elements */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #adc6ff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
                                {/* Pipeline Route Visualizer */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
                                    <path className="opacity-50" d="M 50 350 Q 200 300 400 200 T 750 50" fill="none" stroke="#adc6ff" strokeDasharray="8,4" strokeWidth="2"></path>
                                    {/* Escravos Node */}
                                    <circle className="animate-pulse shadow-[0_0_10px_#00a572]" cx="50" cy="350" fill="#00a572" r="6"></circle>
                                    <text fill="#dbe1ff" fontFamily="JetBrains Mono" fontSize="10" x="65" y="355">ESCRAVOS_HUB [NOMINAL]</text>
                                    {/* Alert Node */}
                                    <circle className="animate-pulse" cx="400" cy="200" fill={isElevated ? "#ffb4ab" : "#00a572"} r="8"></circle>
                                    {isElevated && <circle className="animate-ping" cx="400" cy="200" fill="none" r="12" stroke="#ffb4ab" strokeWidth="1"></circle>}
                                    <text fill={isElevated ? "#ffb4ab" : "#dbe1ff"} fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" x="415" y="205">
                                        {isElevated ? "SEC_042_ALERT [INTRUSION]" : "SEC_042_HUB [NOMINAL]"}
                                    </text>
                                    {/* Bonny Node */}
                                    <circle cx="750" cy="50" fill="#00a572" r="6"></circle>
                                    <text fill="#dbe1ff" fontFamily="JetBrains Mono" fontSize="10" x="650" y="45">BONNY_TER_09 [NOMINAL]</text>
                                </svg>
                                <div className="absolute bottom-4 left-4 flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                                        <span className="font-data-mono text-[10px] text-on-surface-variant">NOMINAL</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                        <span className="font-data-mono text-[10px] text-on-surface-variant">ALERT</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-error"></div>
                                        <span className="font-data-mono text-[10px] text-on-surface-variant">CRITICAL</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Acoustic Spectrogram */}
                        <section className="glass-panel bg-surface-container-low/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-label-caps text-label-caps text-primary">ACOUSTIC WATERFALL SPECTROGRAM</h3>
                                <span className="font-data-mono text-[10px] text-on-surface-variant">RANGE: 0Hz - 1000Hz</span>
                            </div>
                            <div className="w-full h-32 bg-surface-container-lowest relative overflow-hidden flex items-end gap-[2px]">
                                {/* Visualized Spectrogram Bars */}
                                <div className="flex-1 bg-tertiary/20 h-[20%]"></div>
                                <div className="flex-1 bg-tertiary/30 h-[25%]"></div>
                                <div className="flex-1 bg-tertiary/40 h-[40%]"></div>
                                <div className={`flex-1 ${isElevated ? 'bg-secondary shadow-[0_0_15px_rgba(255,178,183,0.5)]' : 'bg-tertiary/50'} h-[80%]`}></div>
                                <div className={`flex-1 ${isElevated ? 'bg-secondary/80' : 'bg-tertiary/60'} h-[90%]`}></div>
                                <div className={`flex-1 ${isElevated ? 'bg-secondary/60' : 'bg-tertiary/50'} h-[70%]`}></div>
                                <div className="flex-1 bg-tertiary/30 h-[30%]"></div>
                                <div className="flex-1 bg-tertiary/20 h-[15%]"></div>
                                <div className="flex-1 bg-tertiary/10 h-[10%]"></div>
                                <div className="flex-1 bg-tertiary/5 h-[5%]"></div>
                                {/* Add more mock bars to fill width */}
                                <div className="flex-1 bg-tertiary/20 h-[22%]"></div>
                                <div className="flex-1 bg-tertiary/30 h-[28%]"></div>
                                <div className="flex-1 bg-tertiary/40 h-[35%]"></div>
                                <div className="flex-1 bg-tertiary/50 h-[42%]"></div>
                                <div className="flex-1 bg-tertiary/60 h-[50%]"></div>
                                <div className="flex-1 bg-tertiary/70 h-[55%]"></div>
                                <div className="flex-1 bg-tertiary/80 h-[60%]"></div>
                                <div className="flex-1 bg-tertiary/90 h-[65%]"></div>
                                <div className="flex-1 bg-tertiary h-[70%]"></div>
                                <div className="flex-1 bg-tertiary/90 h-[60%]"></div>
                                <div className="flex-1 bg-tertiary/80 h-[50%]"></div>
                                <div className="flex-1 bg-tertiary/70 h-[40%]"></div>
                            </div>
                            <div className="flex justify-between mt-2 font-data-mono text-[9px] text-outline">
                                <span>0Hz</span>
                                <span>250Hz</span>
                                <span>500Hz</span>
                                <span>750Hz</span>
                                <span>1000Hz</span>
                            </div>
                        </section>
                    </div>
                    {/* Right Column: AI Threat Classifier */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
                        <section className="glass-panel bg-surface-container-low/50 rounded-lg p-4 flex flex-col h-full max-h-[550px]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-label-caps text-label-caps text-primary">AI THREAT INTRUSION CLASSIFIER</h3>
                                    <p className="font-data-mono text-[10px] text-on-surface-variant">ACTIVE INFERENCE ENGINE v4.2</p>
                                </div>
                                <span className={`font-label-caps text-[10px] px-2 py-0.5 border ${isElevated ? 'text-error border-error' : 'text-tertiary border-tertiary'}`}>
                                    {isElevated ? "THREAT_DETECTED" : "ALL_SECURE"}
                                </span>
                            </div>
                            <div className="space-y-4 flex-1">
                                {/* Classification Rows */}
                                <div className="bg-surface-container-highest/30 border border-outline-variant/30 p-3">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-data-mono text-data-mono text-on-surface">MECHANICAL_DIGGING</span>
                                        <span className="font-data-mono text-data-mono text-secondary">{isElevated ? "98.4%" : "12.4%"}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary shadow-[0_0_8px_rgba(255,178,183,0.4)] transition-all duration-500" style={{ width: isElevated ? "98.4%" : "12.4%" }}></div>
                                    </div>
                                </div>
                                <div className="bg-surface-container-highest/10 border border-outline-variant/20 p-3">
                                    <div className="flex justify-between mb-2 opacity-60">
                                        <span className="font-data-mono text-data-mono text-on-surface">HEAVY_VEHICLE_TRANSIT</span>
                                        <span className="font-data-mono text-data-mono">12.1%</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                                        <div className="h-full bg-tertiary/40" style={{ width: "12.1%" }}></div>
                                    </div>
                                </div>
                                <div className="bg-surface-container-highest/10 border border-outline-variant/20 p-3">
                                    <div className="flex justify-between mb-2 opacity-60">
                                        <span className="font-data-mono text-data-mono text-on-surface">FOOTFALL_CADENCE</span>
                                        <span className="font-data-mono text-data-mono">03.5%</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                                        <div className="h-full bg-tertiary/40" style={{ width: "3.5%" }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto space-y-3 pt-6 border-t border-outline-variant/30">
                                <button 
                                    onClick={handleListenThreat}
                                    className="w-full bg-primary text-on-primary py-3 font-label-caps text-label-caps flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer font-bold"
                                >
                                    <span className="material-symbols-outlined">volume_up</span>
                                    LISTEN TO THREAT
                                </button>
                                <button 
                                    onClick={handleMuteFeed}
                                    className="w-full bg-transparent border border-outline-variant text-on-surface-variant py-2 font-label-caps text-label-caps hover:bg-outline-variant/20 transition-all cursor-pointer"
                                >
                                    MUTE FEED
                                </button>
                            </div>
                        </section>
                        {/* Signal Image Placeholder */}
                        <div className="glass-panel bg-surface-container-lowest h-40 rounded-lg overflow-hidden group">
                            <img className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt="A complex electronic signal waveform visualization on a deep obsidian digital screen..." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf6x-C3R9Z3jcCno_n33uRV4W6NVBH-K-sTvSvv4Ohmno8qplwXd8HGbvyko-2RXvo2hxnEV4FUbRUOjSJKpLihsOlBvRgdXc8pXr0tdO3DURCMscFapmLTGPghtbOD3GI8XY0sxtd3WKeSIqODPTK8ZxghRItfEo_0DF1P8wzdOg_edpY-YzlW3XaM15RKuOnVPcPBMTbOQ2xr_vysDhAceaUMvAsCiJNZroZSVf9nERjWivHLs8BaLK_UB8SItk7QYddoCQXzxQ"/>
                        </div>
                    </div>
                    {/* Terminal Log: Bottom */}
                    <section className="col-span-12 glass-panel bg-surface-container-low/80 rounded-lg p-4 h-48 flex flex-col">
                        <div className="flex items-center gap-4 mb-2 border-b border-outline-variant/30 pb-2">
                            <h3 className="font-label-caps text-label-caps text-tertiary flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                                AUTONOMOUS SECURITY APPRAISAL LOG
                            </h3>
                            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
                            <span className="font-data-mono text-[10px] text-outline">ST_01.LOG_0942</span>
                        </div>
                        <div className="flex-1 font-data-mono text-data-mono text-tertiary overflow-y-auto space-y-1 custom-scrollbar">
                            {logs.map((lg, idx) => (
                                <p key={idx} className="text-[12px]">
                                    <span className="text-outline">[{new Date().toLocaleTimeString()}]</span> &gt; {lg}
                                </p>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
            {/* Floating UI elements */}
            <div className="fixed bottom-margin right-margin z-50 flex flex-col gap-3">
                <button className="w-12 h-12 bg-secondary text-on-secondary rounded-lg flex items-center justify-center shadow-lg hover:rotate-90 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined">warning</span>
                </button>
            </div>
        </div>
    );
}
