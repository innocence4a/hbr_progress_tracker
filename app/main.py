"""HBR Progress Tracker のバックエンド。

- data/characters.csv をマスタデータ(DB代わり)として読み込みAPIで返す
- 所持/凸数の進捗は data/progress.json に保存する
- IMAGES_DIR(.env)配下の画像を /images/ 以下で静的配信する
- static/ 配下のフロントエンド(index.html等)もこのサーバーから配信する
"""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.csv_loader import load_styles
from app.progress_store import get_style_progress, load_progress, update_style_progress

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
IMAGES_DIR = Path(os.getenv("IMAGES_DIR", BASE_DIR / "images")).expanduser().resolve()

for sub_dir in (IMAGES_DIR / "characters", IMAGES_DIR / "styles"):
    sub_dir.mkdir(parents=True, exist_ok=True)

MAX_LIMIT_BREAK = 5

app = FastAPI(title="HBR Progress Tracker API")


def _styles_with_progress():
    progress = load_progress()
    return [{**style, **get_style_progress(style["id"], progress)} for style in load_styles()]


@app.get("/api/styles")
def list_styles(
    character_id: Optional[str] = None,
    rarity_rank: Optional[str] = None,
    owned: Optional[bool] = None,
):
    styles = _styles_with_progress()

    if character_id:
        styles = [s for s in styles if s["characterId"] == character_id]
    if rarity_rank:
        styles = [s for s in styles if s["rarityRank"] == rarity_rank]
    if owned is not None:
        styles = [s for s in styles if s["owned"] == owned]

    styles.sort(key=lambda s: s["releaseDate"], reverse=True)
    return styles


@app.get("/api/characters")
def list_characters():
    grouped = {}

    for style in _styles_with_progress():
        cid = style["characterId"]
        if cid not in grouped:
            grouped[cid] = {"id": cid, "name": style["characterName"], "styles": []}
        grouped[cid]["styles"].append(style)

    characters = []
    for cid, data in grouped.items():
        styles = sorted(data["styles"], key=lambda s: s["releaseDate"], reverse=True)
        owned_count = sum(1 for s in styles if s["owned"])
        total_limit_break = sum(s["limitBreak"] for s in styles)
        characters.append({
            "id": cid,
            "name": data["name"],
            "styleCount": len(styles),
            "ownedCount": owned_count,
            "totalLimitBreak": total_limit_break,
            "maxLimitBreak": len(styles) * MAX_LIMIT_BREAK,
            "fullyOwned": owned_count == len(styles),
            "styles": styles,
        })

    characters.sort(key=lambda c: c["name"])
    return characters


class ProgressUpdate(BaseModel):
    owned: Optional[bool] = None
    limitBreak: Optional[int] = Field(default=None, ge=0, le=MAX_LIMIT_BREAK)


@app.patch("/api/styles/{style_id}/progress")
def patch_style_progress(style_id: str, update: ProgressUpdate):
    valid_ids = {s["id"] for s in load_styles()}
    if style_id not in valid_ids:
        raise HTTPException(status_code=404, detail="style not found")

    if update.owned is None and update.limitBreak is None:
        raise HTTPException(status_code=400, detail="owned または limitBreak を指定してください")

    return update_style_progress(style_id, owned=update.owned, limit_break=update.limitBreak)


# 画像フォルダ(.envのIMAGES_DIR)を /images/ で配信
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

# フロントエンド一式(index.html等)を配信。APIルートより後にマウントすることで
# /api/* を優先的にマッチさせる。
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
