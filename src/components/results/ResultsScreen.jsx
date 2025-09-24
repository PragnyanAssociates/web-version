import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import TeacherAdminResultsScreen from './TeacherAdminResultsScreen';
import StudentResultsScreen from './StudentResultsScreen';

const ResultsScreen = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex-1 justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    if (user.role === 'student') {
        return <StudentResultsScreen navigation={navigation} />;
    } else if (user.role === 'teacher' || user.role === 'admin') {
        return <TeacherAdminResultsScreen navigation={navigation} />;
    }

    return null;
};

export default ResultsScreen;
