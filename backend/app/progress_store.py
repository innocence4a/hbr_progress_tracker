"""ユーザーの「所持」「凸数」進捗を管理する。

CSV(マスタデータ)とは別ファイル(data/progress.json)に保存することで、
CSVを更新・再取込しても進捗が消えないようにする。
"""

import json
import threading
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROGRESS_PATH = DATA_DIR / "progress.json"

_lock = threading.Lock()

DEFAULT_ENTRY = {"owned": False, "limitBreak": 0}


def load_progress():
    if not PROGRESS_PATH.exists():
        return {}
    with open(PROGRESS_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_progress(progress):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2, sort_keys=True)


def get_style_progress(style_id, progress=None):
    progress = progress if progress is not None else load_progress()
    return {**DEFAULT_ENTRY, **progress.get(style_id, {})}


def update_style_progress(style_id, owned=None, limit_break=None):
    with _lock:
        progress = load_progress()
        entry = {**DEFAULT_ENTRY, **progress.get(style_id, {})}

        if owned is not None:
            entry["owned"] = owned
            if not owned:
                entry["limitBreak"] = 0
        if limit_break is not None:
            entry["limitBreak"] = limit_break
            if limit_break > 0:
                entry["owned"] = True

        progress[style_id] = entry
        save_progress(progress)
        return entry
