import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import FeaturedRecipes from "../components/FeaturedRecipes";
import { Container, Row, Col, Button } from "react-bootstrap";
import PhotoRecipeFinder from "../components/DietaryPreferences";
import DietaryPreferences from "../components/DietaryPreferences";

function Home() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = React.useState("");

  useEffect(() => {
  if (!localStorage.getItem("authToken")) {
    navigate("/login");
  } else {
    navigate("/home");
  }
}, [navigate]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <Container className="text-center mt-5">
      <h1>Welcome to CookMate 🍴</h1>
      <p>Discover healthy and sustainable recipes tailored to you.</p>
      <Row className="justify-content-center my-4">
        <Col md={8}>
          <input
            type="text"
            placeholder="Search recipes by ingredients..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "70%",
              padding: "10px",
              borderRadius: "30px",
              border: "1px solid #ccc",
              textAlign: "center",
            }}
          />
          <Button variant="success" className="ms-2" onClick={handleSearch}>
            Search
          </Button>
        </Col>
      </Row>
      <DietaryPreferences />
      <FeaturedRecipes />
    </Container>
  );
}

export default Home;
