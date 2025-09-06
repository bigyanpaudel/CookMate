import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { Container, Row, Col, Toast } from "react-bootstrap";
import { fetchRecipesWithUser } from "../API/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery().get("q") || "";
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!query) return;
      setLoading(true);
      setError("");
      try {
        const fetched = await fetchRecipesWithUser(query);
        setRecipes(fetched.data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query]);

  return (
    <Container className="mt-4">
      <h2>Search results for "{query}"</h2>
      {loading && <p>Loading...</p>}
      <Row>
        {recipes.map((recipe) => (
          <Col xs={12} sm={6} md={4} lg={3} key={recipe.recipeId}>
            <RecipeCard
            recipeId={recipe.recipeId}
            title={recipe.name}           // map name → title
            calories={recipe.calories}
            ingredients={recipe.ingredients}
            instructions={recipe.instructions}
            cookTime={recipe.cookTime}
            image={recipe.imageUrl}       // map imageUrl → image
            avgRate={recipe.avgRate || 0} // fallback if null
            />
          </Col>
        ))}
      </Row>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={2000}
        autohide
        bg="danger"
        style={{ position: "fixed", top: "1rem", right: "1rem" }}
      >
        <Toast.Body>{error}</Toast.Body>
      </Toast>
    </Container>
  );
}

export default SearchResults;
