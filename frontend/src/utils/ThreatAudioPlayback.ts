/**
 * Immersive Tactical Audio Synthesizer using the HTML5 Web Audio API.
 * Simulates what fiber-optic Distributed Acoustic Sensing (DAS) cables hear
 * when subjected to illicit excavation (shoveling) or hot-tapping (drilling).
 */
export class ThreatAudioPlayback {
    private ctx: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private isPlaying: boolean = false;
    private activeInterval: NodeJS.Timeout | null = null;

    constructor() {
        // AudioContext initialized on first user interaction
    }

    private initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
            this.gainNode.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public playThreat(anomalyType: string) {
        this.stop();
        this.initContext();
        if (!this.ctx || !this.gainNode) return;

        this.isPlaying = true;

        if (anomalyType === 'excavation') {
            // Rhythmic muffled digging thuds (30-80 Hz)
            this.activeInterval = setInterval(() => {
                if (!this.ctx || !this.gainNode || !this.isPlaying) return;

                const osc = this.ctx.createOscillator();
                const thudGain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(65, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

                thudGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
                thudGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

                osc.connect(thudGain);
                thudGain.connect(this.gainNode);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.25);
            }, 800);
        } else if (anomalyType === 'hot_tapping') {
            // High-frequency continuous metallic drill whine (600-850 Hz) + modulation
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const drillGain = this.ctx.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(720, this.ctx.currentTime);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(840, this.ctx.currentTime);

            drillGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

            osc1.connect(drillGain);
            osc2.connect(drillGain);
            drillGain.connect(this.gainNode);

            osc1.start();
            osc2.start();

            // Store oscillators on interval to stop them cleanly
            this.activeInterval = setInterval(() => {
                if (this.ctx && this.isPlaying) {
                    // Slight frequency modulation to simulate drill bit catching iron
                    osc1.frequency.setValueAtTime(720 + (Math.random() * 40 - 20), this.ctx.currentTime);
                }
            }, 100) as any;

            // Attach stop callback
            (this as any)._drillOscs = [osc1, osc2];
        } else if (anomalyType === 'corrosion_leak') {
            // High-pressure hissing (filtered white noise)
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = buffer;
            noiseSource.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

            const hissGain = this.ctx.createGain();
            hissGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

            noiseSource.connect(filter);
            filter.connect(hissGain);
            hissGain.connect(this.gainNode);

            noiseSource.start();
            (this as any)._noiseSource = noiseSource;
        }
    }

    public stop() {
        this.isPlaying = false;
        if (this.activeInterval) {
            clearInterval(this.activeInterval);
            this.activeInterval = null;
        }
        if ((this as any)._drillOscs) {
            (this as any)._drillOscs.forEach((osc: any) => {
                try { osc.stop(); } catch(e){}
            });
            (this as any)._drillOscs = null;
        }
        if ((this as any)._noiseSource) {
            try { (this as any)._noiseSource.stop(); } catch(e){}
            (this as any)._noiseSource = null;
        }
    }
}
