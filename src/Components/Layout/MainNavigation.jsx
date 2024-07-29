import { Link } from 'react-router-dom';
import classes from './MainNavigation.module.css';
import { Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * MainNavigation component renders the navigation bar with links to different pages.
 * It also provides a logout button if a user is logged in.
 */
function MainNavigation() {

    const { currentUser, logout } = useAuth();

    /**
    * handleLogout function logs the user out by calling the logout function from the Auth context.
    * It also handles any errors that might occur during the logout process.
    */
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };


    return (
        <header className={classes.header}>
            <Link to='/IMPS/Home/'>
                <div className={classes.logo}>
                   IMPS AR
                </div>
            </Link>
            <nav>
                <ul>
                    <li>
                        <Link to='/IMPS/Media-Manager'>
                            <Button variant="contained" size="medium" sx={{ color: 'black', backgroundColor: 'white', '&:hover': { color: 'white', backgroundColor: 'black', }, borderColor: 'info.main' }}>
                                Media Manager
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to='/IMPS/Media-Sequencer'>
                            <Button variant="contained" size="medium" sx={{ color: 'black', backgroundColor: 'white', '&:hover': { color: 'white', backgroundColor: 'black', }, borderColor: 'info.main' }}>
                                Media Sequencer
                            </Button>
                        </Link>
                    </li>
                    {currentUser && (
                        <li>
                            <Button onClick={handleLogout} variant="contained" size="medium" sx={{ color: 'black', backgroundColor: 'white', '&:hover': { color: 'white', backgroundColor: 'black', }, borderColor: 'info.main' }}>
                                Log Out
                            </Button>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default MainNavigation;