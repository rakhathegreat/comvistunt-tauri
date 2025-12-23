import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type DataInputProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    loading?: boolean;
};

export default function DataInput({ value, onChange, onSubmit, loading }: DataInputProps) {
    const canSubmit = value.trim().length > 0 && !loading;

    return (
        <div className="flex flex-col gap-3 min-w-2xl w-full max-w-3xl">
            <div className="flex flex-row gap-2 items-stretch">
                <div className="relative flex-1 w-full">
                    <Search strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && canSubmit) onSubmit();
                        }}
                        placeholder="Search for name or NIK"
                        className="h-12 w-full pl-9 pr-4 border bg-white border-gray-300 text-black font-medium rounded-md md:text-base tracking-tight placeholder:font-normal placeholder:text-gray-400"
                    />
                </div>
                <Button
                    variant='default'
                    animation={true}
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className="h-12 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Loading..." : "Next"}
                </Button>
            </div>
        </div>
    );
}
