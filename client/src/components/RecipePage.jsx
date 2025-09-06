import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { CiStar } from "react-icons/ci";

function RecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/recipe/${id}`)
      .then((res) => res.json())
      .then(setRecipe)
      .catch((err) => console.error(err));
  }, [id]);

  const handleRecommendations = () => {
    if (!recipe?.ingredients) return;
    setLoadingRecs(true);

    const ingList = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : recipe.ingredients.split(","); // normalize to array

    fetch(
      `http://127.0.0.1:8000/search?ingredients=${encodeURIComponent(
        ingList.join(",")
      )}&user_id=1`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingRecs(false));
  };

  if (!recipe) return <p>Loading...</p>;

  // Normalize ingredients & instructions
  const ingredientList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : recipe.ingredients?.split(",") || [];

  const instructionList = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : recipe.instructions?.split(/[,\.]/) || [];

  return (
    <div
      className="recipe-page"
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Main Recipe Card */}
      <div
        className="shadow-lg rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #ffffff, #f9f9f9)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Image */}
        <img
          src={recipe.imageUrl || "https://via.placeholder.com/600x350?text=No+Image"}
          alt={recipe.name}
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "cover",
          }}
        />

        <div style={{ padding: "1.5rem" }}>
          {/* Title */}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            {recipe.name}
          </h1>

          {/* Meta info */}
          <p style={{ marginBottom: "1rem", color: "#555" }}>
            <b>Cook Time:</b> {recipe.cookTime || "N/A"} | <b>Calories:</b>{" "}
            {recipe.calories} kcal
          </p>

          {/* Rating */}
          <div className="rating d-flex mb-3">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index}>
                {index < recipe.avgRate ? (
                  <FaStar color="gold" size={20} />
                ) : (
                  <CiStar color="gray" size={20} />
                )}
              </span>
            ))}
          </div>

          {/* Ingredients */}
          <section
            className="shadow-sm rounded-md p-3 mb-4"
            style={{
              background: "#fafafa",
              transition: "transform 0.2s",
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
              🛒 Ingredients
            </h3>
            <ul
              style={{
                columns: 2,
                listStyle: "none",
                paddingLeft: 0,
                margin: 0,
              }}
            >
              {ingredientList.map((ing, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  ✅ {ing.trim()}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section
            className="shadow-sm rounded-md p-3 mb-4"
            style={{
              background: "#fafafa",
              transition: "transform 0.2s",
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
              👩‍🍳 Instructions
            </h3>
            <ol style={{ paddingLeft: "1.2rem" }}>
              {instructionList.map((step, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {step.trim()}
                </li>
              ))}
            </ol>
          </section>

          {/* Nutrition Facts */}
          <section
            className="shadow-sm rounded-md p-3 mb-4"
            style={{
              background: "#fafafa",
              transition: "transform 0.2s",
            }}
          >
            <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
              🥗 Nutrition Facts
            </h3>
            <p>🍗 Protein: {recipe.proteinContent} g</p>
            <p>🥓 Fat: {recipe.fatContent} g</p>
            <p>🍞 Carbs: {recipe.carbohydrateContent} g</p>
            <p>🌾 Fiber: {recipe.fiberContent} g</p>
          </section>

          {/* AI Recommendations */}
          {!recommendations.length && !loadingRecs && (
            <button
              className="btn btn-primary mt-3"
              onClick={handleRecommendations}
              style={{
                background: "#6b4ce6",
                color: "white",
                border: "none",
                borderRadius: "5px",
                padding: "0.6rem 1.2rem",
                cursor: "pointer",
              }}
            >
              Get AI Recommendations
            </button>
          )}

          {loadingRecs && <p>Loading recommendations...</p>}

          {recommendations.length > 0 && (
            <div className="mt-4">
              <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
                🤖 AI Recommended Recipes
              </h3>
              <div className="row">
                {recommendations.map((rec) => (
                  <div className="col-md-4" key={rec.recipeId || rec.id}>
                    <Link
                      to={`/recipe/${rec.recipeId || rec.id}`}
                      className="card shadow-sm text-decoration-none"
                      style={{
                        margin: "1rem 0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        color: "inherit",
                        textDecoration: "none",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 10px rgba(0,0,0,0.1)";
                      }}
                    >
                      <img
                        src={
                          rec.imageUrl ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        alt={rec.name}
                        style={{
                          height: "180px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                      <div className="card-body text-center">
                        <h5
                          style={{ fontWeight: "600", marginBottom: "0.5rem" }}
                        >
                          {rec.name}
                        </h5>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "#666",
                          }}
                        >
                          {rec.calories
                            ? `${rec.calories} kcal`
                            : "No calorie info"}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipePage;
