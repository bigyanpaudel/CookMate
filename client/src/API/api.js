import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getRecommendationsByIngredients(ingredients) {
  const response = await fetch(
    `http://127.0.0.1:5000/recommend/by_ingredients?ingredients=${ingredients}`
  );
  return response.json();
}

export async function getRecommendationsByRecipe(recipe) {
  const response = await fetch(
    `http://127.0.0.1:5000/recommend/by_recipe?recipe=${recipe}`
  );
  return response.json();
}


export const signup = async (formData) => {
  try {
    const response = await api.post("/api/auth/signup", formData);
    debugger
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
          }
    throw new Error("Network error occurred.");
  }
};

export const login = async (formData) => {
  try {
    const response = await api.post("/api/auth/login", formData);
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Network error occurred.");
  }
};

export const fetchRecipesWithUser = async (query) => {
  try {
    const { userId } = await tokenToId(); // { success: true, userId: 4 }
    const res = await axios.get("http://localhost:8000/search", {
      params: { ingredients: query, user_id: userId },
      // optional hardening:
      timeout: 15000,
      headers: { "Accept": "application/json" },
      validateStatus: () => true, // don't throw for 4xx/5xx
    });

    // Normalize the shape so callers can always read .status / .data
    const data = res?.data ?? {};
    return {
      status: data.status ?? (res.status === 200 ? "success" : "error"),
      data: data.data ?? [],
      suggestion: data.suggestion ?? null,
      message: data.message ?? (res.statusText || null),
      httpStatus: res.status,
    };
  } catch (err) {
    // Network/CORS/timeout — no res object
    return {
      status: "error",
      data: [],
      suggestion: null,
      message:
        err?.message === "Network Error"
          ? "Network error (is the AI service running on :8000?)"
          : (err?.message || "Unexpected error"),
      httpStatus: 0,
    };
  }
};

export const addFavoriteRecipes = async (userId, recipeId) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/favorite/addFavorite', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      recipeId: recipeId
    })
  });
  return response.json();
};

export const addRating = async (recipeId, rating) => {
  try {
    const token = await tokenToId();
    const userId = token.userId;
    const response = await api.post(`/api/rating/addRating/${userId}`, {
      recipeId: recipeId,
      userRating: rating,
    });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw new Error(`${error.message}`);
    }
  }
};

export const getFavorites = async () => {
  try {
    const { data: response } = await api.get("/api/auth/tokenToId", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const userId = response.userId;

    console.log(userId);

    const { data: favorites } = await api.get(`/api/favorites/${userId}`);

    return favorites;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Network error occurred.");
  }
};

export const tokenToId = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No token found. Please log in.");
  }

  try {
    const { data: tokenResponse } = await api.get("/api/auth/tokenToId", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Token response:", tokenResponse);
    return tokenResponse;
  } catch (error) {
    console.error("Error fetching token to ID:", error);
    throw new Error(`${error}`);
  }
};

export const getFavoriteDetails = async () => {
  try {
    const token = await tokenToId();
    const userId = token.userId;
    console.log(userId);
    const response = await api.get(
      `/api/favorite/getFavoriteDetails/${userId}`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching favorites:", err);
    throw new Error(`${err}`);
  }
};

export const deleteFavoriteRecipe = async (recipeId) => {
  try {
    const token = await tokenToId();
    const userId = token.userId;
    const response = await api.delete(
      `/api/favorite/removeFavorite/${userId}/${recipeId}`,
      {
        userId: userId,
        recipeId: recipeId,
      }
    );
    console.log(userId, recipeId);
    console.log(response)
    return response;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      throw new Error(error.message || "Network error occurred.");
    }
  }
};

export const getRating = async () => {
  try {
    const token = await tokenToId();
    const userId = token.userId;
    console.log(userId);
    const response = await api.get(`/api/rating/getRating/${userId}`);

    if (
      response.data &&
      response.data.message === "No ratings found for the user."
    ) {
      console.log("No ratings found for this user and recipe.");
      return null;
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error fetching favorite rating:", error.response.data);
      return error.response.data;
    }
    console.error("Network error occurred:", error);
    throw new Error("An error occurred while fetching the rating.");
  }
};

export const signout = async () => {
  try {
    await api.post("/api/auth/signout");
    localStorage.clear();
    return { message: "Signed out successfully" };
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Network error occurred.");
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete("/api/auth/delete-account");

    localStorage.removeItem("authToken");
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw new Error("Network error occurred.");
  }
};

export default api;
