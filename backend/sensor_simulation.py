import numpy as np
import time
import random
from typing import Dict, List, Any

class DASSensorArray:
    """
    Simulates a Distributed Acoustic Sensing (DAS) fiber-optic array 
    strapped along a 100km crude oil export pipeline.
    Generates realistic frequency spectrums (FFT) and pressure telemetry.
    """
    def __init__(self):
        self.waypoints = [
            {"id": "SEG-001", "name": "Escravos Terminal Manifold", "lat": 5.584, "lng": 5.248, "baseline_pressure": 85.0},
            {"id": "SEG-002", "name": "Forcados River Crossing", "lat": 5.362, "lng": 5.412, "baseline_pressure": 82.5},
            {"id": "SEG-003", "name": "Nembe Creek Trunkline (NCTL)", "lat": 4.521, "lng": 6.415, "baseline_pressure": 78.0},
            {"id": "SEG-004", "name": "Rambler Swamp Flowstation", "lat": 4.815, "lng": 6.021, "baseline_pressure": 74.2},
            {"id": "SEG-005", "name": "Bonny Export Terminal Depot", "lat": 4.431, "lng": 7.152, "baseline_pressure": 70.0}
        ]
        self.current_anomaly: Dict[str, Any] = {"type": "none", "segment_id": None}

    def trigger_anomaly(self, anomaly_type: str, segment_id: str):
        """Injects an illicit third-party intrusion or leak anomaly into a specific segment."""
        self.current_anomaly = {"type": anomaly_type, "segment_id": segment_id}

    def reset_anomaly(self):
        """Restores nominal operating baseline."""
        self.current_anomaly = {"type": "none", "segment_id": None}

    def generate_telemetry(self) -> List[Dict[str, Any]]:
        """Generates real-time acoustic spectra and hydraulic pressure across all waypoints."""
        telemetry = []
        for wp in self.waypoints:
            is_anomalous = (self.current_anomaly["segment_id"] == wp["id"])
            anomaly_type = self.current_anomaly["type"] if is_anomalous else "none"

            # Generate base frequency spectrum (10 bins from 0Hz to 1000Hz)
            frequencies = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
            amplitudes = []

            # Simulate baseline ambient noise (Ocean waves, rain, distant traffic)
            for f in frequencies:
                # 1/f ambient noise roll-off + random flutter
                base_amp = (1000.0 / (f + 50.0)) * random.uniform(0.5, 1.5)
                amplitudes.append(round(base_amp, 2))

            pressure = wp["baseline_pressure"] + random.uniform(-0.5, 0.5)
            status = "Nominal"

            if is_anomalous:
                if anomaly_type == "excavation":
                    # Heavy low-frequency thuds (100-300Hz spikes)
                    amplitudes[0] += random.uniform(45.0, 65.0)
                    amplitudes[1] += random.uniform(55.0, 75.0)
                    amplitudes[2] += random.uniform(30.0, 45.0)
                    status = "Intrusion_Warning"
                elif anomaly_type == "hot_tapping":
                    # High-frequency metallic drill whine (600-900Hz spikes)
                    amplitudes[5] += random.uniform(60.0, 85.0)
                    amplitudes[6] += random.uniform(70.0, 95.0)
                    amplitudes[7] += random.uniform(50.0, 70.0)
                    status = "Active_Tapping"
                elif anomaly_type == "corrosion_leak":
                    # High-frequency hiss across upper band + hydraulic pressure drop
                    amplitudes[4] += random.uniform(35.0, 50.0)
                    amplitudes[6] += random.uniform(40.0, 60.0)
                    amplitudes[8] += random.uniform(45.0, 65.0)
                    pressure -= random.uniform(12.0, 18.0)
                    status = "Pressure_Leak"

            telemetry.append({
                "segment_id": wp["id"],
                "name": wp["name"],
                "lat": wp["lat"],
                "lng": wp["lng"],
                "timestamp": time.time(),
                "pressure_psi": round(pressure, 1),
                "acoustic_amplitudes": amplitudes,
                "status": status,
                "active_anomaly": anomaly_type
            })
        return telemetry
