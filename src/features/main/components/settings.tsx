import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { IfaceIp } from "../types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Settings } from "lucide-react";


export function SettingsToggle() {
    const [ip, setIp] = useState<string>("");

    const fetchIp = useCallback(async () => {
        const ips = await invoke<IfaceIp[]>("list_local_ips");
        return ips[0]?.ip ?? "";
    }, []);

    useEffect(() => {
        fetchIp()
            .then((localIp) => {
                if (localIp) {
                    console.log("Local IP:", localIp);
                    setIp(localIp);
                } else {
                    console.warn("Tidak ada IP non-loopback ditemukan.");
                }
            })
            .catch((err) => {
                console.error("Gagal mengambil IP:", err);
            });
    }, [fetchIp]);

    const handleExit = useCallback(async () => {
        try {
            const current = getCurrentWebviewWindow();
            await current.close();
        } catch (err) {
            console.error("Gagal menutup aplikasi:", err);
        }
    }, []);

    return (
        <Dialog>
        <DialogTrigger className="absolute top-6 -right-11">
            <Settings className="w-7 h-7 text-gray-400" />
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
                    <Field>
                        <FieldLabel htmlFor="input-demo-api-key">IP</FieldLabel>
                        <Input
                            id="input-demo-api-key"
                            type="text"
                            value={ip}
                            readOnly
                            placeholder="IP belum tersedia"
                        />
                        <FieldDescription>
                            Ini digunakan untuk menghubungkan kamera.
                        </FieldDescription>
                    </Field>
            </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <div className="flex w-full">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleExit}
                    >
                        Exit App
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
