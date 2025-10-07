import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
});

// Leaderboard
export const getLeaderboard = async () => {
  try {
    const response = await API.get("/api/leaderboard/"); // <-- add /api
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

// Final reveal (student of the year)
export const getReveal = async () => {
  try {
    const response = await API.get("/api/reveal/"); // <-- must match FastAPI route
    return response.data;
  } catch (error) {
    console.error("Error fetching winner:", error);
    return null;
  }
};
