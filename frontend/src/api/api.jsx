import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend URL
});

export const getLeaderboard = async () => {
  try {
    const response = await API.get("/leaderboard/");
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
