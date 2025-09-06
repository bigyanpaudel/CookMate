import os
import pandas as pd
from sqlalchemy import create_engine, text

# ---- Config ----
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UTILS_DIR = os.path.join(BASE_DIR, "utils")
CSV_PATH  = os.path.join(UTILS_DIR, "updatedRecipe.csv")

PG_URL = (
    os.getenv("PG_URL")
    or "postgresql+psycopg2://cookmate_user:cookmate_pass@localhost:5432/cookmate"
)

# ---- Load CSV ----
df = pd.read_csv(CSV_PATH, quotechar='"', encoding="utf-8")
if "﻿RecipeId" in df.columns:
    df = df.rename(columns={"﻿RecipeId": "RecipeId"})

# keep only the columns you need
recipes = df[[
    "RecipeId", "Name", "RecipeIngredientParts", "RecipeInstructions",
    "TotalTime", "CookTime", "Calories", "Images", "AggregatedRating"
]].copy()

# ---- Connect DB ----
engine = create_engine(PG_URL)

with engine.begin() as conn:
    for _, row in recipes.iterrows():
        conn.execute(
            text("""
                INSERT INTO "Recipes" ("RecipeId", "Name", "Ingredients", "Instructions",
                                       "TotalTime", "CookTime", "Calories", "Images", "AggregatedRating")
                VALUES (:rid, :name, :ing, :inst, :tt, :ct, :cal, :img, :rating)
                ON CONFLICT ("RecipeId") DO NOTHING
            """),
            {
                "rid": int(row["RecipeId"]),
                "name": str(row["Name"]),
                "ing": str(row["RecipeIngredientParts"]),
                "inst": str(row["RecipeInstructions"]),
                "tt": str(row["TotalTime"]),
                "ct": str(row["CookTime"]),
                "cal": float(row["Calories"]) if not pd.isna(row["Calories"]) else None,
                "img": str(row["Images"]),
                "rating": float(row["AggregatedRating"]) if not pd.isna(row["AggregatedRating"]) else None,
            }
        )

print("✅ Recipes table seeded successfully!")
