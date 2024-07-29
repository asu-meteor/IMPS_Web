import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';


/**
 * PrivateRoute component restricts access to its children based on user authentication.
 * If a user is authenticated, it renders the children components.
 * If not, it redirects the user to the login page.
 */
const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();

    return currentUser ? children : <Navigate to="/IMPS/LoginPage" />;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;