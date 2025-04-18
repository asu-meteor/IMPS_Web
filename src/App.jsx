import Layout from './Components/Layout/Layout';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import MediaManager from './Pages/ContentManagement/MediaManager';
import MediaSequencer from './Pages/ContentSequencing/MediaSequencer';
import LoginPage from './Pages/Authenticator/LoginPage';
import SignUpPage from './Pages/Authenticator/SignupPage';
import PrivateRoute from './Components/PrivateRoute';
import { Navigate } from 'react-router-dom';
import ModifySequence from './Pages/ContentSequencing/ModifySequence';

/*
 * Entry point for the app. This function is also declaring valid routes, and sets up a cookie system that
 * 1. Does not let the user access any routes under <PrivateRoute/> before signing in
 * 2. Automatically directs the user to the sign in page
 */
function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/IMPS/Login" element={<LoginPage />} />
                <Route path="/IMPS/SignUp" element={<SignUpPage />} />


                <Route
                    path="/IMPS/Home"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/IMPS/Media-Manager"
                    element={
                        <PrivateRoute>
                            <MediaManager />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/IMPS/Media-Sequencer"
                    element={
                        <PrivateRoute>
                            <MediaSequencer />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/IMPS/Media-Sequencer/:sequenceId"
                    element={
                        <PrivateRoute>
                            <MediaSequencer />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/IMPS/Visualize-Model"
                    element={
                        <PrivateRoute>
                            <ModifySequence sequenceID="default" />
                        </PrivateRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/IMPS/Login" />} />
            </Routes>
        </Layout>
    );
}

export default App;
