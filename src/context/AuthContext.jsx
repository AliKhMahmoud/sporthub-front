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
  // قراءة المستخدم المخزن مسبقاً في localStorage عند البدء لتجنب ضياع الحالة عند F5
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sportsHub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();

        // استخراج المستخدم بناءً على هيكلية الـ Backend الموحدة لدينا
        const currentUser = response?.data || response;

        if (currentUser && (currentUser._id || currentUser.id || currentUser.email)) {
          setUser(currentUser);
          localStorage.setItem("sportsHub_user", JSON.stringify(currentUser));
        } else {
          setUser(null);
          localStorage.removeItem("sportsHub_user");
        }
      } catch (error) {
        console.error("Error loading user in AuthContext:", error);
        // في حال فشل الـ API (مثل انقطاع الاتصال)، نبقي المستخدم الحالي من الـ localStorage إن وجد لضمان استقرار الواجهة
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData) => {
    // استخراج الكائن المباشر من استجابة الـ login أو الـ register
    const actualUser = userData?.data || userData;
      
    if (actualUser) {
      localStorage.setItem("sportsHub_user", JSON.stringify(actualUser));
      setUser(actualUser); // تحديث الـ state فوراً
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        ...updatedData,
      };
      localStorage.setItem("sportsHub_user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      localStorage.removeItem("sportsHub_user");
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