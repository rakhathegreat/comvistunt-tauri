import { useState } from "react";
import MainPage from "@/features/main/pages/main";
import PreviewPage from "@/features/preview/pages/preview";
import ResultPage from "@/features/main/pages/results";
import type { AppState, CaptureResult } from "@/app/types";
import type { ChildRecord } from "@/features/main/types";

export default function MainLayout() {
    const [appState, setAppState] = useState<AppState>('main');
    const [selectedChild, setSelectedChild] = useState<ChildRecord | null>(null);
    const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);

    return (
        <>
            {appState === 'main' && (
                <MainPage
                    appState={appState}
                    setAppState={setAppState}
                    selectedChild={selectedChild}
                    setSelectedChild={setSelectedChild}
                    captureResult={captureResult}
                    setCaptureResult={setCaptureResult}
                />
            )}
            {appState === 'preview' && (
                <PreviewPage
                    appState={appState}
                    setAppState={setAppState}
                    selectedChild={selectedChild}
                    setSelectedChild={setSelectedChild}
                    captureResult={captureResult}
                    setCaptureResult={setCaptureResult}
                />
            )}
            {appState === 'results' && (
                <ResultPage
                    appState={appState}
                    setAppState={setAppState}
                    selectedChild={selectedChild}
                    setSelectedChild={setSelectedChild}
                    captureResult={captureResult}
                    setCaptureResult={setCaptureResult}
                />
            )}
        </>
    );
}
