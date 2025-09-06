import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RecipeRecommender:
    def __init__(self, recipe_file="utils/updatedRecipe.csv"):
        self.recipes = pd.read_csv(recipe_file, encoding="utf-8")

        # ✅ Use the right column for ingredients
        self.ingredient_col = "RecipeIngredientParts"

        self.tfidf = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = self.tfidf.fit_transform(self.recipes[self.ingredient_col].astype(str))

    def recommend_by_recipe(self, recipe_title, top_n=5):
        try:
            idx = self.recipes[self.recipes['Name'].str.lower() == recipe_title.lower()].index[0]
        except IndexError:
            return []
        sim_scores = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
        top_indices = sim_scores.argsort()[-top_n-1:-1][::-1]
        return self.recipes.iloc[top_indices][['Name', self.ingredient_col]].to_dict(orient="records")

    def recommend_by_ingredients(self, ingredients, top_n=5):
        query_vec = self.tfidf.transform([ingredients])
        sim_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_indices = sim_scores.argsort()[-top_n:][::-1]
        return self.recipes.iloc[top_indices][['Name', self.ingredient_col]].to_dict(orient="records")
