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

        // استخراج كائن المستخدم بدقة بغض النظر عن هيكلية الـ Response
        const currentUser =
          response?.data?.user ||
          response?.data ||
          response?.user ||
          response;

        // التأكد من وجود كائن مستخدم حقيقي ويحتوي على بيانات الـ id أو الـ email أو الـ role
        if (currentUser && (currentUser.id || currentUser._id || currentUser.email || currentUser.role)) {
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

  // فحص الأدمن
  const isAdmin =
    user?.roleName === "SuperAdmin" ||
    user?.roleName === "Admin" ||
    user?.roleId === 6 ||
    user?.roleId === "6" ||
    user?.isAdmin === true ||
    user?.role === "admin" ||
    user?.role === "SuperAdmin";

  // فحص المدرب المعتمد
  const isCoach =
    (user?.role === "coach" || user?.roleName === "Coach") &&
    user?.coachStatus === "approved";

  // اللاعب
  const isAthlete =
    !isAdmin &&
    !isCoach &&
    (user?.role === "athlete" ||
      user?.roleName === "Athlete" ||
      (!user?.role && !user?.roleName));

  const isPendingCoach =
    (user?.role === "coach" || user?.requestedRole === "coach") &&
    user?.coachStatus === "pending";

  const isRejectedCoach =
    (user?.role === "coach" || user?.requestedRole === "coach") &&
    user?.coachStatus === "rejected";

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