import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        console.log("API getCurrentUser Response:", response);

        // تعديل هنا لضمان التقاط المستخدم من استجابة الـ API لديك
        const currentUser =
          response?.data?.user ||
          response?.user ||
          response?.data ||
          response;

        setUser(currentUser || null);
      } catch (error) {
        console.error("Error loading user in AuthContext:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      
      const loggedInUser =
        response?.data?.user ||
        response?.user ||
        response?.data ||
        response;
      
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedData } : updatedData));
  };

  const userRole = user?.role?.toLowerCase() || "";
  const coachStatus = user?.coachStatus?.toLowerCase() || "";

  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isCoach = userRole === "coach" && (coachStatus === "approved" || !coachStatus);
  const isPendingCoach = userRole === "coach" && coachStatus === "pending";
  const isRejectedCoach = userRole === "coach" && coachStatus === "rejected";
  const isAthlete = userRole === "athlete";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isCoach,
        isAthlete,
        isAdmin,
        isPendingCoach,
        isRejectedCoach,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);