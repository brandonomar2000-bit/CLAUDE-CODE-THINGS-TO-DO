#!/usr/bin/env python3
"""Hook de Claude Code: convierte la transcripcion de la sesion en Markdown.

Se ejecuta en Stop, PreCompact y SessionEnd. Lee el JSON del hook por stdin,
abre transcript_path (JSONL) y escribe .claude/logs/<fecha>_<sesion>.md con
los mensajes del usuario, las respuestas, el razonamiento visible (bloques
"thinking", cuando la transcripcion los incluye) y un resumen de herramientas.
Nunca falla de forma ruidosa: un hook roto no debe frenar la sesion.
"""
import json, os, sys, datetime

def text_of(content):
    if isinstance(content, str):
        return [("texto", content)]
    out = []
    for b in content or []:
        t = b.get("type")
        if t == "text":
            out.append(("texto", b.get("text", "")))
        elif t == "thinking":
            out.append(("razonamiento", b.get("thinking", "")))
        elif t == "tool_use":
            inp = b.get("input", {})
            desc = inp.get("description") or inp.get("file_path") or inp.get("command", "")
            out.append(("herramienta", f"`{b.get('name')}` · {str(desc)[:200]}"))
        elif t == "tool_result":
            c = b.get("content")
            s = c if isinstance(c, str) else " ".join(x.get("text", "") for x in (c or []) if isinstance(x, dict))
            out.append(("resultado", s[:400]))
    return out

def main():
    try:
        hook = json.load(sys.stdin)
    except Exception:
        return
    path = hook.get("transcript_path")
    if not path or not os.path.exists(path):
        return
    root = hook.get("cwd") or os.getcwd()
    logdir = os.path.join(root, ".claude", "logs")
    os.makedirs(logdir, exist_ok=True)
    sid = (hook.get("session_id") or "sesion")[:8]
    day = datetime.date.today().isoformat()
    out = [f"# Sesión {sid} · {day}", "", f"Evento: `{hook.get('hook_event_name', '?')}`", ""]
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                e = json.loads(line)
            except Exception:
                continue
            msg = e.get("message") or {}
            role = msg.get("role") or e.get("type")
            if role not in ("user", "assistant"):
                continue
            for kind, txt in text_of(msg.get("content")):
                if not txt.strip():
                    continue
                if kind == "razonamiento":
                    out += ["<details><summary>Razonamiento</summary>", "", txt.strip(), "", "</details>", ""]
                elif kind == "herramienta":
                    out.append(f"- 🔧 {txt}")
                elif kind == "resultado":
                    continue
                else:
                    who = "🧑 Usuario" if role == "user" else "🤖 Claude"
                    out += [f"### {who}", "", txt.strip(), ""]
    with open(os.path.join(logdir, f"{day}_{sid}.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))

if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
