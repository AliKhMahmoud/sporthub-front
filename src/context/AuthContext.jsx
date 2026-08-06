import  { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser } from "../services/authService"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم عند تحميل التطبيق لأول مرة
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        console.log("API getCurrentUser Response:", response);

        const currentUser =
          response?.data?.user ||
          response?.data ||
          response?.user ||
          response;

        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user in AuthContext:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // دالة تسجيل الدخول
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials); // استدعاء دالة ملف الخدمات الصحيحة
      
      // جلب بيانات المستخدم كما كانت سابقاً
      const loggedInUser =
        response?.data?.user ||
        response?.data ||
        response?.user ||
        response;
      
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  // تحديث بيانات المستخدم محلياً
  const updateUser = (updatedData) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedData } : updatedData));
  };

  // استخراج القيم الأساسية بشكل ديناميكي لتتحدث فور تغير الـ user
  const userRole = user?.role?.toLowerCase() || "";
  const coachStatus = user?.coachStatus?.toLowerCase() || "";

  const isAdmin =
    userRole === "admin" ||
    userRole === "superadmin" ||
    user?.roleName === "SuperAdmin" ||
    user?.roleName === "Admin" ||
    user?.roleId === 6 ||
    user?.isAdmin === true;

  const isCoach = userRole === "coach" && coachStatus === "approved";
  const isPendingCoach = userRole === "coach" && coachStatus === "pending";
  const isRejectedCoach = userRole === "coach" && coachStatus === "rejected";
  const isAthlete = userRole === "athlete" || (!isCoach && !isAdmin && !isPendingCoach && !isRejectedCoach);

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