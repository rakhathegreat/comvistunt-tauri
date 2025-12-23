import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, Ruler, Scale } from "lucide-react";

const METRICS_STREAM_URL = "http://127.0.0.1:8000/video/metrics/stream";

export type MetricsPayload = {
    status: "success" | "no_landmark" | "no_data";
    message?: string;
    height: number | null;
    weight: number | null;
    has_landmarks: boolean;
    updated_at: string | null;
};

type ConnectionState = "connecting" | "open" | "error";

type RealtimeDataProps = {
    onMetricsUpdate?: (payload: MetricsPayload) => void;
};

export function RealtimeData({ onMetricsUpdate }: RealtimeDataProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

    useEffect(() => {
        let isCancelled = false;
        const source = new EventSource(METRICS_STREAM_URL);

        source.onopen = () => {
            if (isCancelled) return;
            setConnectionState("open");
        };

        source.onmessage = (event) => {
            if (isCancelled) return;
            try {
                const payload = JSON.parse(event.data) as MetricsPayload;
                setMetrics(payload);
                onMetricsUpdate?.(payload);
                setConnectionState("open");
            } catch (error) {
                console.error("Failed to parse metrics payload", error);
                setConnectionState("error");
            }
        };

        source.onerror = () => {
            if (isCancelled) return;
            setConnectionState((prev) => (prev === "open" ? "connecting" : "error"));
        };

        return () => {
            isCancelled = true;
            source.close();
        };
    }, [onMetricsUpdate]);

    const formatValue = (value?: number | null) => {
        if (value === null || value === undefined) return "--";
        const rounded = Math.round(value * 10) / 10;
        return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
    };
    
    const statusColor = (() => {
        if (connectionState === "error") return "bg-red-500";
        if (connectionState === "connecting") return "bg-amber-400";
        if (!metrics || metrics.status === "no_data") return "bg-slate-400";
        if (metrics.status === "no_landmark") return "bg-yellow-400";
        return "bg-emerald-600";
    })();

    return (
        <div className={`flex flex-col backdrop-blur-lg border border-white/10 bg-black/30 p-2 ${isOpen ? "pb-2" : "pb-0"} gap-2 rounded-md`}>
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                    <span className="text-sm tracking-wide text-white/90">DATA REALTIME</span>
                </div>
                <Button
                    variant="custom"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Sembunyikan data realtime" : "Tampilkan data realtime"}
                    className="hover:bg-black/10"
                >
                    <ChevronUp
                        strokeWidth={2.5}
                        className={`w-4.5 h-4.5 text-white/90 transition-transform duration-200 ${isOpen ? "rotate-0" : "rotate-180"}`}
                    />
                </Button>
            </div>
            <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
                <div className="flex flex-row gap-2 overflow-hidden">
                    <div className="flex w-full flex-col shadow-inner border border-white/10 bg-white/10 backdrop-blur-lg p-4 rounded-md gap-2">
                        <div className="flex items-center justify-between text-white/60">
                            <span className="text-xs font-normal tracking-wider">TINGGI</span>
                            <Ruler strokeWidth={2} className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-semibold">{formatValue(metrics?.height)}</span>
                            <span className="text-sm font-normal tracking-wide">Centimeter</span>
                        </div>
                    </div>
                    <div className="flex w-full flex-col shadow-inner border border-white/10 bg-white/10 backdrop-blur-lg p-4 rounded-md gap-2">
                        <div className="flex items-center justify-between text-white/60">
                            <span className="text-xs font-normal tracking-wider">BERAT</span>
                            <Scale strokeWidth={2} className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-semibold">{formatValue(metrics?.weight)}</span>
                            <span className="text-sm font-normal tracking-wide">Kilogram</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
