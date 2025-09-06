import React, { useState, useEffect } from "react";
import { Card, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../css/RecipeCard.css";
import { IoHeartCircleOutline, IoHeart } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

function RecipeCard({ recipeId, title, calories, image, avgRate, cookTime, ingredients, instructions }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Check if recipe is already in favorites
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const favorited = favorites.some(fav => fav.id === recipeId);
    setIsFavorited(favorited);
  }, [recipeId]);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    
    try {
      const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
      
      if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
        setIsFavorited(false);
        setMessage(`${title} removed from favorites!`);
      } else {
        // Add to favorites
        const newFavorite = {
          id: recipeId,
          name: title,
          image: image,
          cookTime: cookTime || "Unknown",
          avgRate: avgRate || 0,
          calories: calories || 0,
          ingredients: ingredients || "No ingredients available",
          instructions: instructions || "No instructions available"
        };
        
        favorites.push(newFavorite);
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
        setIsFavorited(true);
        setMessage(`${title} added to favorites!`);
      }
    } catch (error) {
      console.error('Error managing favorites:', error);
      setMessage("An error occurred while managing favorites.");
    }
    
    setShowToast(true);
  };

  const firstImage = image

  return (
    <div>
      <ToastContainer position="bottom-start" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
          style={{ backgroundColor: "#3f2fee", color: "white" }}
        >
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card
        className="recipe-card text-center shadow-sm"
        style={{
          width: "18rem",
          margin: "1rem",
          cursor: "pointer",
          borderRadius: "15px",
          overflow: "hidden",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onClick={() => navigate(`/recipe/${recipeId}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
        }}
      >
        <Card.Img
          variant="top"
          src={firstImage}
          alt={title}
          style={{ height: "200px", objectFit: "cover" }}
        />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            <strong>Calories:</strong> {calories} kcal
          </Card.Text>
          <div className="d-flex justify-content-center mb-2">
            <div className="rating d-flex">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index}>
                  {index < avgRate ? (
                    <FaStar color="gold" size={20} />
                  ) : (
                    <CiStar color="gray" size={20} />
                  )}
                </span>
              )).reverse()}
            </div>
          </div>
          <button
            style={{
              all: "unset",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
            onClick={handleHeartClick}
          >
            {isFavorited ? (
              <IoHeart style={{ fontSize: "40px", color: "red" }} />
            ) : (
              <IoHeartCircleOutline style={{ fontSize: "40px" }} />
            )}
          </button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RecipeCard;