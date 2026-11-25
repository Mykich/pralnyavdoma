"""
Оновлює статичну копію прайсу в index.html з єдиного джерела цін.

    python tools/build_prices.py [шлях до prices.json]   # за замовчуванням ../mini/catalog/prices.json

Ціни НЕ редагуються в index.html вручну: змінюються в mini/catalog/prices.json,
після чого запускається цей скрипт (і js/prices.js підтягує їх на сайті з API).
Розмітка має збігатися з js/prices.js.
"""

import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
DEFAULT_JSON = os.path.join(ROOT, "..", "mini", "catalog", "prices.json")


def fmt(item):
    unit = f" / {item['unit']}" if item.get("unit", "шт") != "шт" else ""
    return f"{item['price']} ₴{unit}"


def render_ids(data, ids):
    by_id = {i["id"]: i for i in data["items"]}
    return "".join(
        f"<li>{html.escape(by_id[int(i)]['name'], quote=False)} — {fmt(by_id[int(i)])}</li>"
        for i in ids.split(",") if int(i) in by_id
    )


def render_sections(data, keys):
    titles = {s["key"]: s["title"] for s in data["sections"]}
    out = []
    for n, key in enumerate(keys.split(",")):
        rows = [i for i in data["items"] if i["section"] == key]
        if not rows:
            continue
        if n > 0:
            out.append(f'<tr><td colspan="2" class="modal__table-group">{html.escape(titles.get(key, key), quote=False)}</td></tr>')
        out += [f"<tr><td>{html.escape(i['name'], quote=False)}</td><td>{fmt(i)}</td></tr>" for i in rows]
    return "".join(out)


def render_b2b(data):
    b2b = data["b2b"]
    frm = "від " if b2b.get("price_from") else ""
    rows = "".join(f"<li>{html.escape(i['name'], quote=False)} — {frm}{i['price']} ₴ / {b2b['unit']}</li>" for i in b2b["items"][:3])
    return rows + f"<li>Мінімальне B2B-замовлення — {b2b['min_kg']} кг або {b2b['min_amount']} ₴</li>"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_JSON
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    with open(INDEX, encoding="utf-8") as f:
        text = f.read()

    text = re.sub(
        r'(<ul class="prices__list" data-price-ids="([\d,]+)">)(.*?)(</ul>)',
        lambda m: m.group(1) + render_ids(data, m.group(2)) + m.group(4), text, flags=re.S)
    text = re.sub(
        r'(<tbody data-price-sections="([\w,]+)">)(.*?)(</tbody>)',
        lambda m: m.group(1) + render_sections(data, m.group(2)) + m.group(4), text, flags=re.S)
    text = re.sub(
        r'(<ul class="b2b__list" data-price-b2b>)(.*?)(</ul>)',
        lambda m: m.group(1) + render_b2b(data) + m.group(3), text, flags=re.S)

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"✅ index.html оновлено з {path} (версія {data['version']})")


if __name__ == "__main__":
    main()
