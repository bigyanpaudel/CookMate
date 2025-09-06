import React, { useState } from "react";
import { Card, Button, Toast, ToastContainer } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

function FavoriteRecipeCard({
  recipeId,
  title,
  calories,
  cookTime,
  ingredients,
  instructions,
  image,
  avgRate,
  onRemove
}) {
  const [flipped, setFlipped] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");

  const handleCardClick = () => {
    setFlipped((prev) => !prev);
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/400x300.png?text=Image+Not+Found";
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    try {
      // Remove from localStorage
      const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
      localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      
      setMessage(`${title} removed from favorites!`);
      setShowToast(true);
      
      // Trigger parent component to refresh
      if (onRemove) {
        onRemove(recipeId);
      }
      
      // Refresh the page to update the list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setMessage("An error occurred while removing the recipe.");
      setShowToast(true);
    }
  };

  // Handle different data formats for ingredients
  const getIngredientList = () => {
    if (typeof ingredients === 'string') {
      // If it's a string, split by common delimiters
      return ingredients.split(/[,\n]/).filter(item => item.trim().length > 0);
    } else if (Array.isArray(ingredients)) {
      return ingredients;
    }
    return ['No ingredients available'];
  };

  // Handle different data formats for instructions
  const getInstructionList = () => {
    if (typeof instructions === 'string') {
      // If it's a string, split by common delimiters
      return instructions.split(/[.\n]/).filter(item => item.trim().length > 0);
    } else if (Array.isArray(instructions)) {
      return instructions;
    }
    return ['No instructions available'];
  };

  const ingredientList = getIngredientList();
  const instructionList = getInstructionList();
  const firstImage = image || "https://via.placeholder.com/400x300.png?text=No+Image";

  return (
    <>
      <ToastContainer position="bottom-start" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          style={{ backgroundColor: "orangered", color: "white" }}
        >
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
        <div
          onClick={handleCardClick}
          style={{
            width: "18rem",        // Use rem units like original
            minWidth: "250px",     // Minimum width to prevent squashing
            height: "30rem",
            borderRadius: "10px",
            cursor: "pointer",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
          }}
        >
          {/* FRONT */}
          <Card
            className="text-center"
            style={{
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "10px",
              position: "absolute",
              width: "100%",
              top: 0,
              left: 0,
            }}
          >
            <Card.Img
              variant="top"
              src={firstImage}
              alt={title}
              onError={handleImageError}
              style={{
                height: "230px",
                objectFit: "cover",
                borderRadius: "10px 10px 0 0",
              }}
            />
            <Card.Body>
              <Card.Title style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{title}</Card.Title>
              <Card.Text>
                <strong>Calories:</strong> {calories} kcal
              </Card.Text>
              <div className="d-flex justify-content-center mb-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index}>
                    {index < Math.round(avgRate || 0) ? (
                      <FaStar color="gold" size={20} />
                    ) : (
                      <CiStar color="gray" size={20} />
                    )}
                  </span>
                ))}
              </div>
              <Button
                variant="link"
                onClick={handleHeartClick}
                style={{ fontSize: "40px", color: "red" }}
              >
                <FaHeart />
              </Button>
            </Card.Body>
          </Card>

          {/* BACK */}
          <Card
            className="text-center"
            style={{
              height: "100%",
              backfaceVisibility: "hidden",
              position: "absolute",
              width: "100%",
              top: 0,
              left: 0,
              transform: "rotateY(180deg)",
              borderRadius: "10px",
              overflowY: "auto",
              paddingBottom: "10px",
            }}
          >
            <Card.Body>
              <Card.Title>Ingredients</Card.Title>
              <ul style={{ textAlign: "left", padding: 0 }}>
                {ingredientList.map((ingredient, index) => (
                  <li key={index} style={{ listStyleType: "none" }}>
                    {ingredient.trim()}
                  </li>
                ))}
              </ul>
              <Card.Title>Instructions</Card.Title>
              <ol style={{ textAlign: "left" }}>
                {instructionList.map((instruction, index) => (
                  <li key={index}>{instruction.trim()}</li>
                ))}
              </ol>
              <p className="mt-3">
                <b>Cook Time: </b>
                {cookTime || "Unknown"}
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
}

export default FavoriteRecipeCard;