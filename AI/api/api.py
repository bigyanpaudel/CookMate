import os, re, string
from typing import Optional, List, Dict, Any
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine

# NLP / ML
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from utils.ai_recommender import RecipeRecommender


# ---- App setup ----
app = FastAPI(title="CookMate API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Globals ----
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UTILS_DIR = os.path.join(BASE_DIR, "utils")
CSV_PATH = os.path.join(UTILS_DIR, "updatedRecipe.csv")

recommender = RecipeRecommender(CSV_PATH)

# ---- Dietary Filtering ----
DIETARY_FILTERS = {
    'vegetarian': {
        'exclude': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'meat', 'bacon', 'ham', 'sausage'],
        'include': []
    },
    'vegan': {
        'exclude': ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'meat', 'bacon', 'ham', 'sausage', 
                   'cheese', 'milk', 'butter', 'cream', 'yogurt', 'egg', 'honey'],
        'include': []
    },
    'gluten-free': {
        'exclude': ['wheat', 'flour', 'bread', 'pasta', 'noodles', 'barley', 'rye'],
        'include': []
    },
    'dairy-free': {
        'exclude': ['cheese', 'milk', 'butter', 'cream', 'yogurt'],
        'include': []
    },
    'low-carb': {
        'exclude': ['rice', 'pasta', 'bread', 'potato', 'noodles'],
        'include': ['protein', 'vegetables']
    },
    'keto': {
        'exclude': ['rice', 'pasta', 'bread', 'potato', 'sugar', 'fruit'],
        'include': ['fat', 'protein', 'low carb']
    },
    'paleo': {
        'exclude': ['grain', 'dairy', 'legume', 'processed'],
        'include': ['meat', 'fish', 'vegetables', 'nuts']
    }
}

ALLERGY_FILTERS = {
    'nuts': ['almond', 'walnut', 'peanut', 'cashew', 'pecan', 'hazelnut'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'scallop', 'oyster'],
    'fish': ['salmon', 'tuna', 'cod', 'trout', 'bass'],
    'eggs': ['egg'],
    'soy': ['soy', 'tofu', 'tempeh'],
    'wheat': ['wheat', 'flour', 'bread'],
    'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt']
}

def apply_dietary_filters(df, dietary_prefs=None, allergies=None):
    """Apply dietary and allergy filters to recipe dataframe"""
    if not dietary_prefs and not allergies:
        return df
    
    filtered_df = df.copy()
    
    # Apply dietary preferences
    if dietary_prefs:
        for pref in dietary_prefs:
            pref_lower = pref.lower().replace('-', '').replace(' ', '')
            if pref_lower in DIETARY_FILTERS:
                filter_config = DIETARY_FILTERS[pref_lower]
                
                # Exclude items
                for exclude_item in filter_config['exclude']:
                    mask = ~(filtered_df['name'].str.lower().str.contains(exclude_item, na=False) |
                            filtered_df['ingredients'].str.lower().str.contains(exclude_item, na=False))
                    filtered_df = filtered_df[mask]
    
    # Apply allergy filters
    if allergies:
        for allergy in allergies:
            allergy_lower = allergy.lower()
            if allergy_lower in ALLERGY_FILTERS:
                allergens = ALLERGY_FILTERS[allergy_lower]
                for allergen in allergens:
                    mask = ~(filtered_df['name'].str.lower().str.contains(allergen, na=False) |
                            filtered_df['ingredients'].str.lower().str.contains(allergen, na=False))
                    filtered_df = filtered_df[mask]
    
    return filtered_df

# ---- Utils ------
def clean_json(obj):
    """Recursively replace NaN/inf with None so JSON is safe."""
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_json(v) for v in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    return obj

def clean_image(val: str) -> str:
    """Clean Images field: remove wrappers, split, dedupe, return first valid URL or fallback."""
    FALLBACK = "https://imgs.search.brave.com/wQGSfW6HB9LQ7WttM6bMy7wbOk7tKuEYEBRcjdNxS8k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cy4x/MjNyZi5jb20vNDUw/d20vcmVkbGluZXZl/Y3Rvci9yZWRsaW5l/dmVjdG9yMTcwMi9y/ZWRsaW5ldmVjdG9y/MTcwMjA2NDExLzcx/NTEyNjA2LXZlY3Rv/ci1pY29uLW9mLXJv/YXN0ZWQtY2hpY2tl/bi1zZXJ2ZWQtb24t/cGxhdGUtd2l0aC1r/bmlmZS1hbmQtZm9y/ay5qcGc_dmVyPTY"

    if not isinstance(val, str) or not val.strip():
        return FALLBACK

    val = val.strip().replace("c(", "").replace(")", "").replace('"', "")
    urls = [u.strip() for u in re.split(r"[,\s]+", val) if u.strip()]
    seen = set()
    urls = [u for u in urls if not (u in seen or seen.add(u))]
    urls = [u.replace("(:max_bytes", "(max_bytes") for u in urls]

    for u in urls:
        if u.startswith("http"):
            return u
    return FALLBACK

def parse_duration(val: str) -> str:
    """Convert ISO8601 PT1H20M -> '1h 20m'."""
    if not isinstance(val, str): return "N/A"
    h, m = 0, 0
    mobj = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", val)
    if mobj:
        h = int(mobj.group(1)) if mobj.group(1) else 0
        m = int(mobj.group(2)) if mobj.group(2) else 0
    return f"{h}h {m}m" if (h or m) else "N/A"

def clean_ingredients(val: str) -> List[str]:
    if not isinstance(val, str): return []
    val = val.replace("c(", "").replace(")", "").replace('"', "")
    return [x.strip() for x in re.split(r"[;,]", val) if x.strip()]

def clean_instructions(val: str) -> List[str]:
    if not isinstance(val, str): return []
    val = val.replace("c(", "").replace(")", "").replace('"', "")
    steps = [x.strip() for x in re.split(r"\.|\n", val) if x.strip()]
    return steps

def load_csv() -> pd.DataFrame:
    if not os.path.exists(CSV_PATH): return pd.DataFrame()
    csv = pd.read_csv(CSV_PATH, quotechar='"', encoding="utf-8")
    if "\ufeffRecipeId" in csv.columns:
        csv = csv.rename(columns={"﻿RecipeId": "RecipeId"})
    return csv

def clean_image_url(raw_url: str) -> str:
    if not raw_url:
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT27gTKHqKhHk3i-EiarE5Q9IND_awvKaKjxw&s"

    if raw_url.startswith("Error: Message"):
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT27gTKHqKhHk3i-EiarE5Q9IND_awvKaKjxw&s"

    url = raw_url.split(",")[0].strip()
    url = url.removeprefix("c(").removesuffix(")").strip('"').strip()
    return url

# ---- Routes ----
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/recipe/{recipe_id}")
def get_recipe(recipe_id: int):
    csv = load_csv()
    if not csv.empty and "RecipeId" in csv.columns:
        row = csv[csv["RecipeId"] == recipe_id]
        if not row.empty:
            r = row.iloc[0]
            return clean_json({
                "recipeId": int(r["RecipeId"]),
                "name": r["Name"],
                "ingredients": clean_ingredients(str(r.get("RecipeIngredientParts"))),
                "instructions": clean_instructions(str(r.get("RecipeInstructions") or r.get("Description"))),
                "cookTime": parse_duration(r.get("TotalTime") or r.get("CookTime")),
                "calories": r.get("Calories"),
                "imageUrl": str(r.get("Images")).replace("c(", "").replace(")", "").replace('"', ""),
                "avgRate": r.get("AggregatedRating"),
                "fatContent": r.get("FatContent"),
                "proteinContent": r.get("ProteinContent"),
                "carbohydrateContent": r.get("CarbohydrateContent"),
                "fiberContent": r.get("FiberContent"),
            })
    raise HTTPException(status_code=404, detail="Recipe not found")

@app.get("/search")
def search(
    user_id: int = Query(...),
    ingredients: str = Query(...),
    dietary: Optional[List[str]] = Query(None),
    allergies: Optional[List[str]] = Query(None),
    cuisine: Optional[List[str]] = Query(None),
    max_calories: Optional[int] = Query(None),
    max_cook_time: Optional[int] = Query(None)
):
    csv = load_csv()
    if csv.empty: 
        return {"status": "success", "data": []}
    
    df = pd.DataFrame({
        "id": pd.to_numeric(csv["RecipeId"], errors="coerce"),
        "name": csv["Name"],
        "ingredients": csv["RecipeIngredientParts"].astype(str),
        "instructions": csv["RecipeInstructions"].fillna(csv["Description"]).astype(str),
        "cookTime": csv["TotalTime"].fillna(csv["CookTime"]),
        "calories": pd.to_numeric(csv["Calories"], errors="coerce"),
        "imageUrl": csv["Images"].astype(str),
        "avgRate": pd.to_numeric(csv["AggregatedRating"], errors="coerce"),
    }).dropna(subset=["id", "name"])

    # Apply dietary and allergy filters
    df = apply_dietary_filters(df, dietary, allergies)
    
    # Apply calorie filter
    if max_calories:
        df = df[df["calories"] <= max_calories]
    
    # Apply cuisine filter
    if cuisine:
        cuisine_mask = pd.Series([False] * len(df))
        for c in cuisine:
            cuisine_mask |= df["name"].str.lower().str.contains(c.lower(), na=False)
        df = df[cuisine_mask]

    # Text search
    q = ingredients.lower()
    tfidf = TfidfVectorizer(stop_words="english")
    sims = cosine_similarity(
        tfidf.fit_transform(df["name"] + " " + df["ingredients"]), 
        tfidf.transform([q])
    )
    df["sim"] = sims[:,0]
    chosen = df.sort_values("sim", ascending=False).head(100)

    return {"status": "success", "data": clean_json([
        {
            "recipeId": int(r["id"]),
            "name": r["name"],
            "ingredients": clean_ingredients(r["ingredients"]),
            "instructions": clean_instructions(r["instructions"]),
            "cookTime": parse_duration(r["cookTime"]),
            "calories": r["calories"],
            "imageUrl": clean_image_url(str(r["imageUrl"])),
            "avgRate": r["avgRate"],
        } for _, r in chosen.iterrows()
    ])}

@app.get("/recommend/by_ingredients")
def recommend_by_ingredients(
    ingredients: str,
    dietary: Optional[List[str]] = Query(None),
    allergies: Optional[List[str]] = Query(None)
):
    # Use existing recommender but apply filters
    base_recommendations = recommender.recommend_by_ingredients(ingredients)
    
    if dietary or allergies:
        # Apply filters to recommendations
        csv = load_csv()
        if not csv.empty:
            df = pd.DataFrame({
                "name": csv["Name"],
                "ingredients": csv["RecipeIngredientParts"].astype(str),
            })
            filtered_df = apply_dietary_filters(df, dietary, allergies)
            
            # Filter recommendations based on filtered recipes
            filtered_names = set(filtered_df["name"].tolist())
            if hasattr(base_recommendations, 'recommendations'):
                base_recommendations['recommendations'] = [
                    rec for rec in base_recommendations['recommendations']
                    if rec.get('name') in filtered_names
                ]
    
    return base_recommendations

@app.get("/recommend/by_recipe")
def recommend_by_recipe(
    recipe: str,
    dietary: Optional[List[str]] = Query(None),
    allergies: Optional[List[str]] = Query(None)
):
    base_recommendations = recommender.recommend_by_recipe(recipe)
    
    if dietary or allergies:
        csv = load_csv()
        if not csv.empty:
            df = pd.DataFrame({
                "name": csv["Name"],
                "ingredients": csv["RecipeIngredientParts"].astype(str),
            })
            filtered_df = apply_dietary_filters(df, dietary, allergies)
            
            filtered_names = set(filtered_df["name"].tolist())
            if hasattr(base_recommendations, 'recommendations'):
                base_recommendations['recommendations'] = [
                    rec for rec in base_recommendations['recommendations']
                    if rec.get('name') in filtered_names
                ]
    
    return base_recommendations

# New endpoint for dietary preferences
@app.get("/dietary-options")
def get_dietary_options():
    return {
        "dietary": list(DIETARY_FILTERS.keys()),
        "allergies": list(ALLERGY_FILTERS.keys()),
        "cuisines": ["italian", "asian", "mexican", "indian", "mediterranean", "american"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)