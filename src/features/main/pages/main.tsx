import { useCallback, useEffect, useRef, useState } from "react";
import DataInput from "../components/data-input";
import Suggestion from "../components/suggestion";
import supabase from "@/shared/service/supabase";
import type { PageProps } from "@/app/types";
import type { ChildRecord } from "../types";
import { SettingsToggle } from "../components/settings";
import { VirtualKeyboard } from "../components/virtual-keyboard";

const RECENT_KEY = "recent_child_search";

export default function MainPage(props: PageProps) {
    const { setAppState, setSelectedChild, selectedChild, setCaptureResult } = props;
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<ChildRecord[]>([]);
    const [recent, setRecent] = useState<ChildRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<ChildRecord | null>(null);
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(RECENT_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as ChildRecord[];
            if (Array.isArray(parsed)) setRecent(parsed.slice(0, 5));
        } catch {
            // abaikan error parsing storage
        }
    }, []);

    const saveRecent = (item: ChildRecord) => {
        setRecent((prev) => {
            const next = [item, ...prev.filter((r) => r.nik !== item.nik)].slice(0, 5);
            try {
                localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            } catch {
                // storage mungkin tidak tersedia
            }
            return next;
        });
    };

    const fetchSuggestions = useCallback(async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("DataAnak")
                .select("nik, nama, gender, umur_bulan")
                .or(`nik.ilike.%${q}%,nama.ilike.%${q}%`)
                .limit(5);

            if (error) throw error;
            setSuggestions(data || []);
        } catch {
            setError("Gagal mengambil data dari server.");
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSuggestions([]);
            return;
        }

        if (
            selected &&
            (trimmed === selected.nik ||
                trimmed === selected.nama ||
                trimmed === `${selected.nama} (${selected.nik})`)
        ) {
            setSuggestions([]);
            return;
        }

        const t = setTimeout(() => {
            if (trimmed.length >= 2) {
                fetchSuggestions(trimmed);
            } else {
                setSuggestions([]);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [query, selected, fetchSuggestions]);

    const handleSelect = (item: ChildRecord) => {
        setSelected(item);
        setQuery(`${item.nik}`);
        setSelectedChild(item);
        saveRecent(item);
        setSuggestions([]);
        setError(null);
    };

    const handleChange = (value: string) => {
        setQuery(value);
        if (selected && !value.includes(selected.nik) && !value.includes(selected.nama)) {
            setSelected(null);
            setSelectedChild(null);
        }
    };

    const handleKeyboardChange = (nextValue: string) => {
        handleChange(nextValue);
    };

    const handleStart = () => {
        if (!query.trim()) {
            setError("Masukkan nama atau NIK terlebih dahulu.");
            return;
        }
        setError(null);
        const childToUse: ChildRecord = selected ?? { nik: query.trim(), nama: query.trim() };
        setSelectedChild(childToUse);
        setCaptureResult(null);
        setKeyboardOpen(false);
        setAppState("preview");
    };

    useEffect(() => {
        if (selectedChild) {
            setSelected(selectedChild);
            setQuery(selectedChild.nik || selectedChild.nama);
        } else {
            setSelected(null);
            setQuery("");
        }
    }, [selectedChild]);

    return (
        <div className="flex relative flex-col items-center justify-center h-screen space-y-3 px-4">
            <SettingsToggle />
            <DataInput
                value={query}
                onChange={handleChange}
                onSubmit={handleStart}
                loading={loading}
                onFocus={() => setKeyboardOpen(true)}
            />
            <Suggestion
                query={query}
                suggestions={suggestions}
                recent={recent}
                loading={loading}
                onSelect={handleSelect}
                error={error}
            />
            <VirtualKeyboard
                open={keyboardOpen}
                value={query}
                onChange={handleKeyboardChange}
                onClose={() => setKeyboardOpen(false)}
                onSubmit={handleStart}
                focusInput={() => inputRef.current?.focus()}
            />
        </div>
    );
}
