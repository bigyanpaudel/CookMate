import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import RecipeCard from "../components/RecipeCard";

function FeaturedRecipes() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 4 different featured recipes - actually good dishes people want to make
    const selectedRecipes = [
      {
        recipeId: 48,
        name: "Boston Cream Pie",
        image: "https://scientificallysweet.com/wp-content/uploads/2024/04/IMG_0034-feature.jpg",
        calories: 688.2,
        ingredients: "margarine, cake flour, baking powder, salt, sugar, vanilla, eggs, milk, sugar, cornstarch, milk, flour, salt, vanilla, butter, vanilla",
        instructions: "Beat egg whites until soft peaks form. Gradually add 1/2 cup sugar, beating until very stiff peaks form. Sift together remaining dry ingredients into another bowl. Add oil, half the milk and vanilla. Beat 1 minute at medium speed. Add remaining milk and egg yolks. Beat 1 minute, scrape bowl. Gently fold in egg whites. Bake in two greased 9x 1.5-inch round pans in 350°F oven for 25 minutes.",
        cookTime: "2 hours 15 minutes",
        avgRate: 4.5
      },
      {
        recipeId: 49,
        name: "Chicken Breasts Lombardi",
        image: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/49/m1z1F8S5mAZgyImm5zYw_Lombardi%20Chicken%203.jpg",
        calories: 627.7,
        ingredients: "fresh mushrooms, butter, boneless skinless chicken breast halves, flour, butter, marsala, chicken broth, salt, mozzarella cheese, parmesan cheese, green onion",
        instructions: "Cook mushrooms in 2 tbsp butter in a large skillet, stirring constantly, just until tender. Remove from heat; set aside. Cut each chicken breast half in half lengthwise. Place each piece of chicken between two sheets of wax paper; flatten to 1/8 thickness, using a meat mallet or rolling pin. Dredge chicken pieces in flour. Place 5 or 6 pieces of chicken in 1 to 2 tbsp butter in a large skillet; cook over medium heat 3 to 4 minutes on each side or until golden.",
        cookTime: "1 hour 15 minutes",
        avgRate: 4.8
      },
      {
        recipeId: 56,
        name: "Buttermilk Pie",
        image: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/56/nTwHmSmmRqGCr5HAUapC_pie-1194.jpg",
        calories: 395.9,
        ingredients: "butter, margarine, sugar, flour, eggs, salt, vanilla, buttermilk",
        instructions: "Preheat oven to 400°F. Beat the butter and sugar together until light. Add the eggs and beat; then beat in vanilla. Sift the dry ingredients together and add to the batter alternatively with the buttermilk; beat until smooth. Pour into a deep dish pie shell and bake at 400F for 10 minutes, reduce heat to 350F and bake for 50-60 additional minutes.",
        cookTime: "1 hour 20 minutes",
        avgRate: 4.9
      },
      {
        recipeId: 76,
        name: "Alfredo Sauce",
        image: "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/76/lfS6kBlpRJMGzvXr3Gkz_AS%204%20-%20final_2.jpg",
        calories: 489.9,
        ingredients: "sweet butter, heavy cream, parmesan cheese, salt, pepper",
        instructions: "Place butter in microwave safe pot and heat on high for 30 seconds or until melted. Add cream and warm on high for approximately 1 minute. Add Parmesan cheese and warm until cheese melts. Add salt and pepper to taste. Pour over 4 servings of warm noodles and toss to coat. Serve immediately.",
        cookTime: "15 minutes",
        avgRate: 4.6
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setFeaturedRecipes(selectedRecipes);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Container className="mt-5">
        <h2 style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: "700",
          background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Featured Recipes
        </h2>
        <div className="text-center">
          <p>Loading featured recipes...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontWeight: "700",
          background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Featured Recipes
      </h2>
      <Row>
        {featuredRecipes.length > 0 ? (
          featuredRecipes.map((recipe) => (
            <Col
              key={recipe.recipeId}
              md={3}
              sm={6}
              xs={12}
              className="mb-4 d-flex justify-content-center"
            >
              <RecipeCard
                recipeId={recipe.recipeId}
                title={recipe.name}
                calories={recipe.calories}
                ingredients={recipe.ingredients}
                instructions={recipe.instructions}
                cookTime={recipe.cookTime}
                image={recipe.image}
                avgRate={recipe.avgRate}
              />
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center">
            <p>No featured recipes available at the moment.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default FeaturedRecipes;