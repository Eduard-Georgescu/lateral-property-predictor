import { useEffect, useState } from "react";
import { Settings2, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkHealth, getApiBase, setApiBase } from "@/lib/lateralApi";
import { toast } from "sonner";

type Status = "idle" | "checking" | "ok" | "error";

export const BackendSettings = ({
  onConnected,
}: {
  onConnected?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBase());
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (open) setUrl(getApiBase());
  }, [open]);

  const test = async (target: string) => {
    setStatus("checking");
    setErrorMsg("");
    const previous = getApiBase();
    setApiBase(target);
    try {
      const h = await checkHealth();
      if (h.status === "ok") {
        setStatus("ok");
        toast.success("Backend connected", {
          description: h.ml_available ? "ML model loaded" : "Physics-only mode",
        });
        onConnected?.();
        return true;
      }
      throw new Error("Unexpected health response");
    } catch (e) {
      setApiBase(previous);
      setStatus("error");
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg);
      return false;
    }
  };

  const save = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus("error");
      setErrorMsg("URL is required");
      return;
    }
    const ok = await test(trimmed);
    if (ok) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Settings2 className="h-4 w-4" />
          Backend
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card-elevated border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Backend connection</DialogTitle>
          <DialogDescription>
            LatERAL runs PyTorch inference on a Hugging Face Space. Paste your Space URL below
            (one-time setup, stored locally in your browser).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="api-url">Space URL</Label>
            <Input
              id="api-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-username-lateral.hf.space"
              className="font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Looks like <span className="font-mono">https://&lt;user&gt;-&lt;space&gt;.hf.space</span> — no trailing slash needed.
            </p>
          </div>

          {status === "ok" && (
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              <Check className="h-4 w-4" /> Connected
            </div>
          )}
          {status === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">Couldn’t reach backend</div>
                <div className="mt-1 text-xs opacity-80 break-all">{errorMsg}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={status === "checking"} className="gap-2">
            {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Test &amp; save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
