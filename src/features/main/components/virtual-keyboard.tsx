import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Delete, Check, X } from "lucide-react";

type VirtualKeyboardProps = {
    open: boolean;
    value: string;
    onChange: (nextValue: string) => void;
    onClose: () => void;
    onSubmit?: () => void;
    focusInput?: () => void;
};

const NUMPAD_LAYOUT = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["CLEAR", "0", "BACKSPACE"],
];

export function VirtualKeyboard({
    open,
    value,
    onChange,
    onClose,
    onSubmit,
    focusInput,
}: VirtualKeyboardProps) {
    const focusActiveInput = () => {
        focusInput?.();
    };

    const handleKeyPress = (key: string) => {
        focusActiveInput();

        switch (key) {
            case "BACKSPACE":
                onChange(value.slice(0, -1));
                return;
            case "SPACE":
                onChange(`${value} `);
                return;
            case "CLEAR":
                onChange("");
                return;
            case "ENTER":
                onSubmit?.();
                return;
            default:
                onChange(`${value}${key}`);
        }
    };

    const renderKeyButton = (
        label: string,
        keyValue: string,
        extraClass?: string,
        variant: "secondary" | "outline" | "default" = "secondary",
    ) => (
        <Button
            key={keyValue}
            variant={variant}
            animation
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKeyPress(keyValue)}
            className={`h-16 flex-1 text-base font-semibold shadow-xs ${extraClass ?? ""}`}
        >
            {label}
        </Button>
    );

    return (
        <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()} dismissible>
            <DrawerContent className="border-t bg-white pb-6 shadow-2xl">
                <div className="mx-auto w-full max-w-4xl px-4">
                    <DrawerHeader className="flex items-start justify-between px-0">
                        <div className="space-y-1">
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" animation className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </DrawerHeader>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-inner p-4 flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2">
                            {NUMPAD_LAYOUT.flat().map((key) => {
                                if (key === "BACKSPACE") {
                                    return (
                                        <Button
                                            key={key}
                                            variant="secondary"
                                            animation
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleKeyPress("BACKSPACE")}
                                            className="h-16 text-base font-semibold shadow-xs"
                                        >
                                            <Delete strokeWidth={2} className="h-5 w-5" />
                                        </Button>
                                    );
                                }
                                if (key === "CLEAR") {
                                    return (
                                        <Button
                                            variant="default"
                                            animation
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleKeyPress("CLEAR")}
                                            className="h-16 flex-1 text-base font-semibold shadow-xs"
                                        >
                                            <Check className="h-5 w-5" />
                                        </Button>
                                    );
                                }
                                return renderKeyButton(key, key);
                            })}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
