import { ArrowRight, Loader2, Search, User } from "lucide-react";
import type { ChildRecord } from "../types";

type SuggestionProps = {
    suggestions: ChildRecord[];
    recent: ChildRecord[];
    query: string;
    loading: boolean;
    onSelect: (item: ChildRecord) => void;
    error?: string | null;
};

export default function Suggestion({ suggestions, recent, query, loading, onSelect, error }: SuggestionProps) {
    const hasQuery = query.trim().length >= 2;
    const items = hasQuery ? suggestions : recent;
    const title = hasQuery ? "hasil pencarian" : "recent search";

    return (
        <div className="flex flex-col w-full items-center gap-3 py-6 px-2 border border-gray-200 rounded-md max-w-3xl">
            <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between px-2">
                    <span className="text-gray-400 text-xs font-normal capitalize">{title}</span>
                    {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                </div>
                <div className="w-full space-y-2">
                    {items.length > 0 && items.map((item) => (
                        <button
                            key={item.nik}
                            type="button"
                            onClick={() => onSelect(item)}
                            className="flex justify-between items-center w-full text-gray-800 px-4 py-3 rounded-md font-medium tracking-tight text-base border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <div className="flex flex-row items-center gap-3 text-left">
                                <User strokeWidth={2} className="w-4.5 h-4.5 text-indigo-600" />
                                <div className="flex flex-col leading-tight">
                                    <span className="font-semibold">{item.nama}</span>
                                    <span className="text-xs text-gray-500">{item.nik}</span>
                                </div>
                            </div>
                            <ArrowRight strokeWidth={2} className="w-4.5 h-4.5 text-gray-400" />
                        </button>
                    ))}

                    {!loading && items.length === 0 && (
                        <div className="flex items-center gap-2 text-gray-500 px-4 py-3 rounded-md border border-dashed border-gray-200 bg-gray-50">
                            <Search strokeWidth={2} className="w-4.5 h-4.5" />
                            <span className="text-sm">
                                {hasQuery ? "Tidak ada hasil yang cocok." : "Belum ada pencarian."}
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
