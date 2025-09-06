import "./App.css";
import { Routes, Route, Link, useParams } from "react-router-dom";
import RecipeList from "./pages/Home";
import Login from "./pages/Login";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Signup from "./pages/Signup";
import {Container} from "react-bootstrap";
import "./App";
import SearchResults from "./pages/SearchResults";
import RecipePage from "./components/RecipePage";

function RecipeWrapper() {
  const { id } = useParams();
  return <RecipePage key={id} id={id} />;   // 👈 force remount when id changes
}

function App() {
  return (
    <div className="App">
      <Container>
      <Header/>
      <Routes>
        <Route path="/" element={<RecipeList/>}></Route>
        <Route path="/home" element={<RecipeList/>}></Route>
        <Route path="/favorites" element={<Favorites />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="*" element={<NotFound />}></Route>
        <Route path="/recipe/:id" element={<RecipeWrapper />} />
      </Routes>
      </Container>
    </div>

  );
}

export default App;
