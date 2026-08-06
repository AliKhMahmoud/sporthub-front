import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        console.log("API getCurrentUser Response:", response); // طباعة للتاكد من الـ API

        // استخراج المستخدم بأي شكل يأتي به الرد
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

  const login = (userData) => {
    // معالجة البيانات أثناء تسجيل الدخول المباشر والتأكد من استخراج الـ data بدقة
    const actualUser = 
      userData?.data?.user || 
      userData?.data || 
      userData?.user || 
      userData;
      
    setUser(actualUser);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
    }
  };

  // توحيد النصوص وحمايتها من تباين الحروف الصغيرة والكبيرة (Case-insensitive)
  const userRole = user?.role?.toLowerCase() || "";
  const roleName = user?.roleName?.toLowerCase() || "";
  const coachStatus = user?.coachStatus?.toLowerCase() || "";
  const requestedRole = user?.requestedRole?.toLowerCase() || "";

  // فحص الأدمن
  const isAdmin =
    roleName === "superadmin" ||
    roleName === "admin" ||
    user?.roleId === 6 ||
    user?.roleId === "6" ||
    user?.isAdmin === true ||
    userRole === "admin" ||
    userRole === "superadmin";

  // فحص المدرب المعتمد
  const isCoach =
    (user?.role === "coach") &&
    coachStatus === "approved";

  // اللاعب
  const isAthlete =
    !isAdmin &&
    !isCoach &&
    (userRole === "athlete" ||
      roleName === "athlete" ||
      (!userRole && !roleName));

  const isPendingCoach =
    (userRole === "coach" || requestedRole === "coach") &&
    coachStatus === "pending";

  const isRejectedCoach =
    (userRole === "coach" || requestedRole === "coach") &&
    coachStatus === "rejected";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAdmin,
        isCoach,
        isAthlete,
        isPendingCoach,
        isRejectedCoach,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };