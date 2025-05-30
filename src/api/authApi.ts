import axios from "axios";

// Replace with your real backend URL
const API_URL = "https://your-backend-url.com/api/auth/login"; 

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(API_URL, {
      email,
      password,
    });

    console.log("Login Response:", response.data);
    return response.data;
    
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);

    // Extract a meaningful error message
    const errorMessage =
      error.response?.data?.message || "Something went wrong. Please try again.";
      
    throw new Error(errorMessage);
  }
};
