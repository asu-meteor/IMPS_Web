import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../Firebase';
import PropTypes from 'prop-types';

const AuthContext = createContext();

/**
 * useAuth hook provides easy access to the AuthContext.
 * 
 * @returns {object} The current user and the logout function.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * AuthProvider component manages the authentication state and provides
 * the current user and logout function to its children.
 * 
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the AuthProvider.
 */
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
    * logout function signs out the current user.
    * 
    * @returns {Promise<void>} A promise that resolves when the user is signed out.
    */
    const logout = () => {
        return signOut(auth);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ currentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};