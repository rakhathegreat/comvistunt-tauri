import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PageProps } from "@/app/types";
import { ImageIcon, Repeat } from "lucide-react";
import supabase from "@/shared/service/supabase";

export default function ResultPage(props: PageProps) {
    const { setAppState, captureResult, selectedChild, setCaptureResult, setSelectedChild } = props;
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

    const rawImage = captureResult?.image ?? null;
    const imageSrc = rawImage
        ? rawImage.startsWith("data:") ? rawImage : `data:image/jpeg;base64,${rawImage}`
        : null;
    const height = captureResult?.height ?? null;
    const weight = captureResult?.weight ?? null;
    const age = captureResult?.age ?? selectedChild?.umur_bulan ?? null;
    // const haz = captureResult?.haz ?? "—";
    // const statusLabel = captureResult?.status ?? "—";
    const heightStatus = captureResult?.heightStatus ?? "—";
    const weightStatus = captureResult?.weightStatus ?? "—";

    const formatNumber = (val: number | null) => {
        if (val === null || val === undefined) return "—";
        const rounded = Math.round(val * 10) / 10;
        return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
    };

    // const badgeTone = (status: string) => {
    //     const s = (status || "").toLowerCase();
    //     if (s === "—" || !s.trim()) {
    //         return {
    //             pill: "bg-slate-100 text-slate-700 border border-slate-200",
    //             dot: "bg-slate-500",
    //         };
    //     }
    //     if (s.includes("sangat") || s.includes("buruk") || s.includes("kurus") || s.includes("berisiko")) {
    //         return {
    //             pill: "bg-rose-100 text-rose-800 border border-rose-200",
    //             dot: "bg-rose-500",
    //         };
    //     }
    //     if (s.includes("pendek") || s.includes("rentan") || s.includes("moderate") || s.includes("kurang")) {
    //         return {
    //             pill: "bg-amber-100 text-amber-800 border border-amber-200",
    //             dot: "bg-amber-500",
    //         };
    //     }
    //     return {
    //         pill: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    //         dot: "bg-emerald-500",
    //     };
    // };

    // const renderBadge = (value: string) => {
    //     const tone = badgeTone(value);
    //     return (
    //         <span className={`inline-flex items-center gap-2 w-max text-xs font-semibold tracking-wide capitalize px-3.5 py-1.5 rounded-full ${tone.pill}`}>
    //             <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
    //             {value || "—"}
    //         </span>
    //     );
    // };

    const normalizeStatus = (val: string | null | undefined) => {
        if (!val || val.trim() === "" || val === "—") return null;
        return val;
    };

    const normalizeImage = () => {
        const img = captureResult?.image;
        if (!img) return null;
        if (img.startsWith("data:")) {
            const [, base64] = img.split(",");
            return base64 ?? img;
        }
        return img;
    };

    const handleSave = async () => {
        if (saving) return;
        setSaveError(null);
        setSaveSuccess(null);

        const nik = selectedChild?.nik ?? null;
        if (!nik) {
            setSaveError("NIK anak tidak tersedia, data tidak dapat disimpan.");
            return;
        }

        const payload = {
            nik,
            tinggi: height,
            berat: weight,
            status_berat: normalizeStatus(weightStatus),
            status_tinggi: normalizeStatus(heightStatus),
            image: normalizeImage(),
        };

        setSaving(true);
        const { error } = await supabase.from("Analisis").insert([payload]);
        setSaving(false);

        if (error) {
            setSaveError(error.message || "Gagal menyimpan data analisis.");
            return;
        }

        setSaveSuccess("Data analisis tersimpan.");
        setCaptureResult(null);
        setSelectedChild(null);
        setAppState('main');
    };

    const handleRetry = () => {
        setCaptureResult(null);
        setAppState('preview');
    };

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-200 text-gray-800">
            <div className="flex flex-col bg-white h-full w-full rounded-lg shadow-lg px-2 py-2">
                <h1 className="font-sans text-lg text-gray-600 font-semibold pl-2 pb-2">
                    HASIL PEMERIKSAAN
                </h1>
                <div className="flex flex-1 gap-2 bg-gray-200 p-2 rounded-lg border border-gray-300">
                    {/* left column */}
                    <div className="flex flex-col w-[60%] gap-4">

                    <div className="w-full flex items-center">
                        <h2 className="text-gray-500 font-sans text-sm font-medium">GAMBAR TANGKAPAN</h2>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm h-68 p-2">
                        <div className="w-full h-full rounded-lg overflow-hidden">
                            {imageSrc ? (
                                <img src={imageSrc} alt="Hasil tangkapan" className="w-full h-full object-cover bg-black" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                    <ImageIcon className="w-12 h-12 mb-2" />
                                    <p>No Image Available</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4'>
                        <Button 
                            variant='custom'
                            animation={true}
                            className="flex-1 h-18 border border-gray-300 text-gray-800"
                            onClick={handleRetry}
                        >
                            <Repeat className="w-5 h-5 font-normal mr-2"/>
                            Ulangi
                        </Button>
                        <Button
                            variant='default'
                            animation={true}
                            className="flex-1 h-18"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                    {(saveError || saveSuccess) && (
                        <p className={`text-sm ${saveError ? "text-rose-600" : "text-emerald-700"}`}>
                            {saveError ?? saveSuccess}
                        </p>
                    )}
                    </div>

                    {/* right column */}
                    <div className="flex-col bg-white border border-gray-300 rounded-lg shadow-sm w-[40%] h-full flex items-center justify-center p-2">
                    <h3 className="text-center rounded-md text-gray-800 w-full py-1 text-sm">
                        SUMMARY
                    </h3>
                    <div className="flex flex-1 w-full flex-col justify-center gap-3 mt-2 p-4 bg-gray-200 border border-gray-300 rounded-md">
                        <div className='flex flex-col'>
                        <p className="text-gray-500 font-sans text-sm">Nama</p>
                        <span className="font-sans font-medium text-sm">{selectedChild?.nama ?? "—"}</span>
                        </div>
                        <div className='flex flex-col'>
                        <p className="text-gray-500 font-sans text-sm">NIK</p>
                        <span className="font-sans font-medium text-sm">{selectedChild?.nik ?? "—"}</span>
                        </div>

                        <div className='flex gap-10'>
                        <div className='flex flex-col'>
                            <p className="text-gray-500 font-sans text-sm">Jenis Kelamin</p>
                            <span className="font-sans font-medium text-sm ">{selectedChild?.gender == 'P' ? "Perempuan" : "Laki-laki"}</span>
                        </div>
                        <div className='flex flex-col'>
                        <p className="text-gray-500 font-sans text-sm">Umur (bulan)</p>
                        <span className="font-sans font-medium text-sm">{formatNumber(age)}</span>
                        </div>
                        </div>

                        <div className='flex gap-10'>
                        <div className='flex flex-col gap-1'>
                            <p className="text-gray-500 font-sans text-sm">Status Tinggi</p>
                            <span className={``}>
                                {heightStatus}
                            </span>
                        </div>inline-flex items-center gap-2 w-max text-xs font-semibold tracking-wide capitalize px-3.5 py-1.5 rounded-md bg-emerald-100/60 border border-emerald-700/60 text-emerald-800
inline-flex items-center gap-2 w-max text-xs font-semibold tracking-wide capitalize px-3.5 py-1.5 rounded-md bg-emerald-100/60 border border-emerald-700/60 text-emerald-800
                        <div className='flex flex-col gap-1'>
                            <p className="text-gray-500 font-sans text-sm">Status Berat</p>
                            <span className={``}>
                                {weightStatus}
                            </span>
                        </div>
                        </div>
                    </div>

                    <div className="flex flex-1 w-full flex-row gap-10 mt-2 p-4 bg-gray-200 border border-gray-300 rounded-md">
                        <div className='flex flex-col justify-center'>
                        <p className="text-gray-500 font-sans text-sm">Berat (kg)</p>
                        <span className="font-sans font-medium text-sm">{formatNumber(weight)}</span>
                        </div>
                        <div className='flex flex-col justify-center'>
                        <p className="text-gray-500 font-sans text-sm">Tinggi (cm)</p>
                        <span className="font-sans font-medium text-sm">{formatNumber(height)}</span>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
