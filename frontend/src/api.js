import axios from "axios";

const API_URL = "http://localhost:5000/api/classify";

export const classifyTestCase = async (text, labels) => {
  try {
    const response = await axios.post(API_URL, {
      text,
      labels
    });
    return response.data;
  } catch (error) {
    console.error("Classification failed:", error);
    return { error: "API request failed" };
  }
};
