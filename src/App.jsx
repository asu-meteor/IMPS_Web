import Layout from './Components/Layout/Layout';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Pages/Home';
import LoginPage from './Pages/Authenticator/LoginPage';
import SignUpPage from './Pages/Authenticator/SignupPage';
import PrivateRoute from './Components/PrivateRoute';
import { Navigate } from 'react-router-dom';


//import LogIn from './Pages/LogIn';
//import SignUp from './Pages/SignUp';
//import Manage from './Pages/ManageContent';
//import Sequence from './Pages/SequenceContent';

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

                <Route path="*" element={<Navigate to="/IMPS/Login" />} />
            </Routes>
        </Layout>
    );
}

export default App;
