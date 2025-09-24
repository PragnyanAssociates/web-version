import React from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import TeacherAdminMaterialsScreen from "./TeacherAdminMaterialsScreen";
import StudentMaterialsScreen from "./StudentMaterialsScreen";

const StudyMaterialsScreen = ({ navigation }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Loader */}
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (user.role === "student") {
    return <StudentMaterialsScreen navigation={navigation} />;
  } else if (user.role === "teacher" || user.role === "admin") {
    return <TeacherAdminMaterialsScreen navigation={navigation} />;
  }

  return null; // Or render a default for other roles
};

export default StudyMaterialsScreen;
