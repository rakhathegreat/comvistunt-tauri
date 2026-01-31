
import type { ChildRecord } from "@/features/main/types";

type CameraStatusProps = {
    child?: ChildRecord | null;
};

export function CameraStatus({ child }: CameraStatusProps) {
    const nik = child?.nik ?? "—";

    return (
        <div className="flex flex-row gap-1">
            <div className="flex w-max items-center gap-2 bg-black/50 border border-white/10 px-2 py-1 rounded-md">
                <span className="bg-emerald-600 w-2 h-2 rounded-full"></span>
                <span className="text-sm font-normal text-white">Camera On</span>
            </div>
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-1 rounded-md">
                <div className="flex flex-col leading-tight">
                    <span className="text-sm text-white/70">{nik}</span>
                </div>
            </div>
        </div>
    );
}
