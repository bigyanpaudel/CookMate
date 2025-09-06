import os, re, string
import pandas as pd

BASE = os.path.dirname(os.path.dirname(__file__))          # .../ai
CSV_PATH = os.path.join(BASE, "utils", "updatedRecipe.csv")
OUT_PATH = os.path.join(BASE, "utils", "nlpWords.txt")

STOP = {
    "a","an","the","and","or","of","for","to","with","on","in","at","by","from",
    "into","over","under","about","as","is","are","was","were","be","been","being",
    "it","its","this","that","these","those","you","your","i","we","they","he","she",
    "but","if","then","than","so","not","no","yes","up","down","out","off","very",
    "can","could","should","would","may","might","will","just","also",
    "cup","cups","tbsp","tsp","tablespoon","tablespoons","teaspoon","teaspoons",
    "ounce","ounces","oz","gram","grams","g","kg","ml","ltr","liter","liters",
    "inch","inches","large","small","medium","fresh","dried","ground","chopped",
    "minced","sliced","diced","whole","skinless","boneless","optional","plus","divided","taste"
}

if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

df = pd.read_csv(CSV_PATH, encoding="utf-8")

text_cols = [c for c in df.columns if c.lower() in {"name","ingredients","instructions","keywords"}]
if not text_cols:
    raise RuntimeError("updatedRecipe.csv needs at least one of: name, ingredients, instructions, keywords")

punct = str.maketrans("", "", string.punctuation)
terms = set()

def add_text(s):
    if not isinstance(s, str): return
    s = s.lower()
    s = re.sub(r"\d+", " ", s)
    s = s.translate(punct)
    for w in s.split():
        if len(w) > 1 and w not in STOP:
            terms.add(w)

for col in text_cols:
    for v in df[col].dropna().tolist():
        add_text(v)

with open(OUT_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(terms)))

print(f"Built {OUT_PATH} with {len(terms)} English terms.")
