import { Button } from "@/components/ui/button";
import type { PageProps } from "@/app/types";

const STOP_URL = "http://127.0.0.1:8000/video/stop";

type ButtonGroupProps = PageProps & {
    onAnalyze: () => void | Promise<void>;
    onCalibrate: () => void | Promise<void>;
    analyzing?: boolean;
    calibrating?: boolean;
};

export function ButtonGroup({ onAnalyze, onCalibrate, analyzing, calibrating }: ButtonGroupProps) {
    return (
        <div className="absolute flex flex-row w-full justify-between bottom-4 z-50 px-4 gap-2 max-w-[dvw]">
            <Button
                variant='custom'
                onClick={onCalibrate}
                animation={true}
                disabled={!!calibrating || !!analyzing}
                className="flex-1 py-6 bg-black/30 border border-white/10 active:bg-stone-800/70 backdrop-blur-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {calibrating ? "Calibrating..." : "Calibrate"}
            </Button>
            <Button
                onClick={onAnalyze}
                animation={true}
                disabled={!!analyzing || !!calibrating}
                className="flex-1 py-6 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {analyzing ? "Processing..." : "Analyze"}
            </Button>
        </div>
    );
}

export function CancelButton(props: PageProps) {
    const { setAppState, setSelectedChild, setCaptureResult } = props;
    const handleCancel = async () => {
        await fetch(STOP_URL, { method: "POST" });
        setSelectedChild(null);
        setCaptureResult(null);
        setAppState('main');
    };

    return (
        <div className="absolute flex flex-col gap-1 top-4 right-4 z-50">
            <Button  variant='custom' onClick={handleCancel} animation={true} className="flex-1 py-3 px-5 bg-stone-800/70 border border-stone-500 active:bg-stone-800/70 font-normal">Cancel</Button>
        </div>
    );
}
