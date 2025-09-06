import React, { useEffect, useState } from "react";
import FavoriteRecipeCard from "../components/FavoriteRecipeCard";
import { Row, Col, Pagination, Container } from "react-bootstrap";
import '../css/Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchFavorites = () => {
      try {
        setLoading(true);
        const storedFavorites = localStorage.getItem('userFavorites');
        const data = storedFavorites ? JSON.parse(storedFavorites) : [];
        console.log('Loaded favorites from localStorage:', data);
        setFavorites(data);
      } catch (err) {
        setError("Error loading favorites from storage");
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const currentItems = favorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <p>Loading favorite recipes...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center mt-5">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </Container>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Container>
        <div className="text-center mt-5">
          <h1 className="favoritePageTitle">Favorite Recipes</h1>
          <p>No favorite recipes found. Start adding some recipes to your favorites!</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="favoritePageTitle">
        Favorite Recipes ({favorites.length})
      </h1>
      <Row className="container-row">
        {currentItems.map((recipe) => (
          <Col key={recipe.id} sm={10} md={6} lg={4} xl={3}>
            <FavoriteRecipeCard
              key={recipe.id}
              recipeId={recipe.id}
              title={recipe.name}
              calories={recipe.calories}
              cookTime={recipe.cookTime}
              ingredients={recipe.ingredients}
              instructions={recipe.instructions}
              image={recipe.image}
              avgRate={recipe.avgRate}
            />
          </Col>
        ))}
      </Row>
           
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </Container>
  );
};

export default Favorites;