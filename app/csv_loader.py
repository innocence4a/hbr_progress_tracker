"""data/characters.csv をキャラクター/スタイルのマスタデータとして読み込む。

CSVを「データベースライク」に使うための唯一の入力元。
所持/凸数などユーザー進捗はここでは扱わない（progress_store.py が別管理）。
"""

import csv
import hashlib
import re
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "characters.csv"

# 「水瀬いちご（CV 愛美）」「成瀬ヒカリ（CV #羽鳥颯希）」のような
# CV表記を取り除いてキャラクター名を正規化する
_CV_PATTERN = re.compile(r"[（(]\s*CV[^）)]*[）)]")

_RARITY_RANKS = ("SS", "S", "A")


def strip_cv(character_name):
    return _CV_PATTERN.sub("", character_name).strip()


def make_style_id(character_name_raw, style_name, release_date):
    key = f"{character_name_raw}|{style_name}|{release_date}"
    return hashlib.md5(key.encode("utf-8")).hexdigest()[:12]


def parse_rarity_rank(rarity):
    for rank in _RARITY_RANKS:
        if rarity.startswith(rank):
            return rank
    return rarity


def _field(row, key):
    return (row.get(key) or "").strip()


def load_styles(csv_path=None):
    """CSVの各行（=各スタイル）を辞書のリストとして返す。空行はスキップする。"""
    path = csv_path or CSV_PATH
    styles = []

    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            character_name_raw = _field(row, "キャラ名")
            style_name = _field(row, "スタイル名")
            if not character_name_raw or not style_name:
                continue

            release_date = _field(row, "リリース日")
            character_name = strip_cv(character_name_raw)
            rarity = _field(row, "レア")
            image_field = _field(row, "画像")
            reference_links = [line.strip() for line in image_field.splitlines() if line.strip()]

            styles.append({
                "id": make_style_id(character_name_raw, style_name, release_date),
                "characterId": character_name,
                "characterName": character_name,
                "characterNameRaw": character_name_raw,
                "styleName": style_name,
                "releaseDate": release_date,
                "mainAttribute": _field(row, "メイン属性"),
                "subAttribute": _field(row, "サブ属性"),
                "role": _field(row, "ロール"),
                "gachaName": _field(row, "ガシャ名"),
                "rarity": rarity,
                "rarityRank": parse_rarity_rank(rarity),
                "unison": _field(row, "ユニゾン").upper() == "TRUE",
                "newOrRerun": _field(row, "新規復刻"),
                "anniversary": _field(row, "周年"),
                "referenceLinks": reference_links,
                "notes": _field(row, "備考"),
            })

    return styles
