import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const csrf = async () => {
    await axios.get("/sanctum/csrf-cookie");
  };

  const getUser = async () => {
    try {
      await csrf();
      const response = await axios.get("/api/user");

      setUser(response.data);
    } catch (error) {
      setUser(null); // Set user to null if an error occurs
    }
  };

  const login = async (data) => {
    try {
      await csrf();
      await axios.post("/login", data);
      await getUser();
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        // Handle login error
      }
    }
  };

  const register = async (data) => {
    try {
      await csrf();
      await axios.post("/register", data);
      await getUser();
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        // Handle register error
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post("/logout");
      setUser(null);
    } catch (error) {
      // Handle logout error
    }
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, errors, getUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
