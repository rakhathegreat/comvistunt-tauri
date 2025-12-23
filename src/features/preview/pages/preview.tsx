import { useEffect, useState } from "react";
import Camera from "../components/camera";
import type { CaptureResult, PageProps } from "@/app/types";
import { RealtimeData, type MetricsPayload } from "../components/realtime-data";
import { CameraStatus } from "../components/camera-status";
import { ButtonGroup, CancelButton } from "../components/button-group";

const CAPTURE_URL = "http://127.0.0.1:8000/capture";
const VIDEO_STOP_URL = "http://127.0.0.1:8000/video/stop";
const STUNTING_RISK_URL = "http://127.0.0.1:8000/stunting-risk";
const CALIBRATE_URL = "http://127.0.0.1:8000/calibrate/aruco";

export default function PreviewPage(props: PageProps) {
    const [cameraActive, setCameraActive] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [calibrating, setCalibrating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [calibrateNotice, setCalibrateNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [latestMetrics, setLatestMetrics] = useState<MetricsPayload | null>(null);
    const { setAppState, selectedChild, setSelectedChild, setCaptureResult, captureResult } = props;

    useEffect(() => {
        if (!calibrateNotice) return;
        const timer = setTimeout(() => setCalibrateNotice(null), 3000);
        return () => clearTimeout(timer);
    }, [calibrateNotice]);

    const blobToDataUrl = (blob: Blob) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Gagal membaca gambar dari server."));
            reader.readAsDataURL(blob);
        });

    const normalizeImagePayload = (raw: string) => {
        if (raw.startsWith("data:")) {
            const [meta, data] = raw.split(",", 2);
            const mimeMatch = meta.match(/^data:(.*?);/);
            return {
                base64: data ?? raw,
                mimeType: mimeMatch?.[1] || "image/jpeg",
            };
        }
        return {
            base64: raw,
            mimeType: "image/jpeg",
        };
    };

    const base64ToBlob = (base64: string, mimeType: string) => {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
    };

    const restartCamera = () => {
        setCameraActive(false);
        setTimeout(() => setCameraActive(true), 150);
    };

    const fetchCapture = async (): Promise<CaptureResult> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        await fetch(VIDEO_STOP_URL, { method: 'POST' });
        
        const res = await fetch(CAPTURE_URL, { method: "POST", signal: controller.signal });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Gagal mengambil gambar (HTTP ${res.status}).`);
        }

        const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

        if (contentType.includes("application/json")) {
            const data = await res.json();
            const image =
                typeof data.image === "string"
                    ? data.image
                    : typeof data.data === "string"
                        ? data.data
                        : typeof data.frame === "string"
                            ? data.frame
                            : null;

            const normalizeAge = (raw: any): number | null => {
                const val = typeof raw === "number" ? raw : Number(raw);
                return Number.isFinite(val) ? val : null;
            };

            return {
                image,
                height: typeof data.height === "number" ? data.height : null,
                weight: typeof data.weight === "number" ? data.weight : null,
                age: normalizeAge(data.age ?? data.umur_bulan ?? data.umur ?? null),
                haz: typeof data.haz === "string" ? data.haz : undefined,
                status: typeof data.status === "string" ? data.status : undefined,
                message: typeof data.message === "string" ? data.message : undefined,
                stuntingRisk:
                    typeof data.stunting_risk === "string"
                        ? data.stunting_risk
                        : typeof data.stuntingRisk === "string"
                            ? data.stuntingRisk
                            : typeof data.risk === "string"
                                ? data.risk
                                : undefined,
                riskScore:
                    typeof data.risk_score === "number"
                        ? data.risk_score
                        : typeof data.riskScore === "number"
                            ? data.riskScore
                            : typeof data.probability === "number"
                                ? data.probability
                                : undefined,
            };
        }

        const blob = await res.blob();
        const image = await blobToDataUrl(blob);
        return { image };
    };

    const analyzeStuntingRisk = async (payload: {
        height: number;
        weight: number;
        age: number;
        gender?: string | null;
    }) => {
        const stringifyDetail = (detail: any): string => {
            if (!detail) return "";
            if (typeof detail === "string" || typeof detail === "number") return String(detail);
            if (Array.isArray(detail)) {
                return detail
                    .map((item) => stringifyDetail(item))
                    .filter(Boolean)
                    .join("; ");
            }
            if (typeof detail === "object") {
                const msg = stringifyDetail(detail.msg || detail.message || detail.detail || "");
                const loc = detail.loc ? ` (${Array.isArray(detail.loc) ? detail.loc.join(".") : detail.loc})` : "";
                const type = detail.type ? ` [${detail.type}]` : "";
                return `${msg}${loc}${type}`.trim();
            }
            return "";
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const params = new URLSearchParams();
        params.set("height", payload.height.toString());
        params.set("weight", payload.weight.toString());
        params.set("age", payload.age.toString());
        if (payload.gender) params.set("gender", payload.gender);

        const res = await fetch(`${STUNTING_RISK_URL}?${params.toString()}`, {
            method: "POST",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const rawBody = await res.text();
        let parsed: any = null;
        try {
            parsed = rawBody ? JSON.parse(rawBody) : null;
        } catch {
            // gunakan rawBody saja
        }

        if (!res.ok) {
            const detail =
                stringifyDetail(parsed?.detail) ||
                stringifyDetail(parsed?.message) ||
                stringifyDetail(parsed?.error) ||
                rawBody ||
                "Tidak diketahui.";
            throw new Error(`Gagal menganalisis risiko stunting (HTTP ${res.status}). ${detail}`);
        }

        const data = parsed && typeof parsed === "object" ? parsed : {};

        const riskLabel =
            typeof data.risk === "string"
                ? data.risk
                : typeof data.risk_level === "string"
                    ? data.risk_level
                    : typeof data.prediction === "string"
                        ? data.prediction
                        : typeof data.status === "string"
                            ? data.status
                            : null;

        const riskScore =
            typeof data.score === "number"
                ? data.score
                : typeof data.risk_score === "number"
                    ? data.risk_score
                    : typeof data.probability === "number"
                        ? data.probability
                        : null;

        return {
            haz: typeof data.haz === "string" ? data.haz : undefined,
            status: typeof data.status === "string" ? data.status : undefined,
            message: typeof data.message === "string" ? data.message : undefined,
            stuntingRisk: riskLabel,
            riskScore,
            heightStatus:
                typeof data.height_status === "string"
                    ? data.height_status
                    : typeof data.heightStatus === "string"
                        ? data.heightStatus
                        : null,
            weightStatus:
                typeof data.weight_status === "string"
                    ? data.weight_status
                    : typeof data.weightStatus === "string"
                        ? data.weightStatus
                        : null,
            heightHaz:
                typeof data.height_haz === "number"
                    ? data.height_haz
                    : typeof data.heightHaz === "number"
                        ? data.heightHaz
                        : null,
            weightHaz:
                typeof data.weight_haz === "number"
                    ? data.weight_haz
                    : typeof data.weightHaz === "number"
                        ? data.weightHaz
                        : null,
        };
    };

    const handleCalibrate = async () => {
        if (calibrating || analyzing) return;
        setCalibrateNotice(null);

        setCalibrating(true);
        try {
            const capturePayload = await fetchCapture();

            if (!capturePayload.image) {
                throw new Error("Tidak ada gambar yang diterima dari endpoint capture.");
            }

            const { base64, mimeType } = normalizeImagePayload(capturePayload.image);
            const blob = base64ToBlob(base64, mimeType);
            const formData = new FormData();
            formData.append("file", blob, "capture.jpg");
            formData.append("image", blob, "capture.jpg");
            formData.append("image_base64", base64);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const res = await fetch(CALIBRATE_URL, {
                method: "POST",
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const bodyText = await res.text();

            if (!res.ok) {
                let detail = bodyText || `Kalibrasi gagal (HTTP ${res.status}).`;
                try {
                    const parsed = bodyText ? JSON.parse(bodyText) : null;
                    if (parsed) {
                        const resultText =
                            typeof parsed.result === "string"
                                ? parsed.result
                                : typeof parsed.result === "number"
                                    ? `Calibrated: ${parsed.result}`
                                    : null;
                        if (resultText) {
                            detail = resultText;
                        } else if (parsed.detail) {
                            const firstDetail = Array.isArray(parsed.detail) ? parsed.detail[0]?.msg || parsed.detail[0]?.message : parsed.detail;
                            detail = typeof firstDetail === "string" ? firstDetail : detail;
                        }
                    }
                } catch {
                    // ignore parse error, use bodyText
                }
                throw new Error(detail);
            }

            let successMessage = bodyText;
            try {
                const parsed = bodyText ? JSON.parse(bodyText) : null;
                if (parsed) {
                    if (parsed.result !== undefined && parsed.result !== null) {
                        successMessage = `Calibrated: ${parsed.result}`;
                    }
                    else if (typeof parsed.message === "string") successMessage = parsed.message;
                    else if (typeof parsed.detail === "string") successMessage = parsed.detail;
                }
            } catch {
                // ignore parse
            }

            setCalibrateNotice({
                type: 'success',
                message: successMessage || "Kalibrasi berhasil.",
            });
        } catch (err: any) {
            console.error(err);
            if (err?.name === "AbortError") {
                const msg = "Permintaan kalibrasi kedaluwarsa, coba lagi.";
                setCalibrateNotice({
                    type: 'error',
                    message: `Error: ${msg}`,
                });
            } else {
                const baseMsg = err?.message || "Gagal mengirim capture untuk kalibrasi.";
                const message = baseMsg?.startsWith("Error:") ? baseMsg : `Error: ${baseMsg}`;
                setCalibrateNotice({
                    type: 'error',
                    message,
                });
            }
        } finally {
            setCalibrating(false);
            restartCamera();
        }
    };

    const handleAnalyze = async () => {
        if (analyzing) return;
        setError(null);
        setCalibrateNotice(null);
        setCaptureResult(null);
        setAnalyzing(true);
        try {
            const capturePayload = await fetchCapture();

            if (!capturePayload.image) {
                throw new Error("Tidak ada gambar yang diterima dari endpoint capture.");
            }

            const height = capturePayload.height ?? latestMetrics?.height ?? null;
            const weight = capturePayload.weight ?? latestMetrics?.weight ?? null;
            const age = capturePayload.age ?? selectedChild?.umur_bulan ?? null;
            const gender = selectedChild?.gender ?? null;

            if (height === null || weight === null || age === null) {
                throw new Error("Data tinggi, berat, atau umur belum lengkap untuk analisis risiko stunting.");
            }

            const riskResult = await analyzeStuntingRisk({
                height,
                weight,
                age,
                ...(gender ? { gender } : {}),
            });

            setCaptureResult({
                ...capturePayload,
                height,
                weight,
                age,
                haz: riskResult.haz ?? capturePayload.haz ?? null,
                status: riskResult.status ?? capturePayload.status,
                message: riskResult.message ?? capturePayload.message,
                stuntingRisk: riskResult.stuntingRisk ?? capturePayload.stuntingRisk ?? null,
                riskScore: riskResult.riskScore ?? capturePayload.riskScore ?? null,
                heightStatus: riskResult.heightStatus ?? capturePayload.heightStatus ?? null,
                weightStatus: riskResult.weightStatus ?? capturePayload.weightStatus ?? null,
                heightHaz: riskResult.heightHaz ?? capturePayload.heightHaz ?? null,
                weightHaz: riskResult.weightHaz ?? capturePayload.weightHaz ?? null,
            });

            await fetch(VIDEO_STOP_URL, { method: 'POST' });
            setAppState('results');
        } catch (err: any) {
            console.error(err);
            if (err?.name === "AbortError") {
                setError("Permintaan kedaluwarsa, coba lagi.");
            } else {
                setError(err?.message || "Gagal mengambil gambar.");
            }
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <main className="relative h-screen w-screen bg-black">
            <div className="absolute flex flex-col gap-1 top-4 left-4 z-50">
                <CameraStatus child={selectedChild} />
                <RealtimeData onMetricsUpdate={setLatestMetrics} />
            </div>

            <CancelButton
                appState={"preview"}
                setAppState={setAppState}
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
                captureResult={captureResult}
                setCaptureResult={setCaptureResult}
            />

            <ButtonGroup
                appState={"preview"}
                setAppState={setAppState}
                selectedChild={selectedChild}
                setSelectedChild={setSelectedChild}
                captureResult={captureResult}
                setCaptureResult={setCaptureResult}
                onAnalyze={handleAnalyze}
                onCalibrate={handleCalibrate}
                analyzing={analyzing}
                calibrating={calibrating}
            />
            {error && (
                <div className="absolute top-15 right-4 z-50 rounded-md bg-red-500/90 text-white px-3 py-2 text-sm shadow-lg">
                    {error}
                </div>
            )}
            {calibrateNotice && (
                <div
                    className={`fade-toast absolute top-15 right-4 z-50 rounded-md px-3 py-2 text-sm shadow-lg ${
                        calibrateNotice.type === 'success'
                            ? "bg-emerald-600/90 text-white"
                            : "bg-red-600/90 text-white"
                    }`}
                >
                    {calibrateNotice.message}
                </div>
            )}
            <Camera active={cameraActive} />
        </main>
    );
}
