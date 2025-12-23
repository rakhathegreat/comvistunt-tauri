import type { ChildRecord } from "@/features/main/types";

export type AppState = 'main' | 'preview' | 'results';

export type CaptureResult = {
    image?: string | null;
    height?: number | null;
    weight?: number | null;
    age?: number | null;
    haz?: string | null;
    status?: string;
    message?: string;
    stuntingRisk?: string | null;
    riskScore?: number | null;
    heightStatus?: string | null;
    weightStatus?: string | null;
    heightHaz?: number | null;
    weightHaz?: number | null;
};

export type PageProps = {
    appState: AppState;
    setAppState: (appState: AppState) => void;
    selectedChild: ChildRecord | null;
    setSelectedChild: (child: ChildRecord | null) => void;
    captureResult: CaptureResult | null;
    setCaptureResult: (result: CaptureResult | null) => void;
};
