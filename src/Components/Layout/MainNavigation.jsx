import { Link } from 'react-router-dom';
import classes from './MainNavigation.module.css';
import { Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

//Function creates menu buttons and links them to their respective subpages.
function MainNavigation() {

    const { currentUser, logout } = useAuth();


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
                   IMPS
                </div>
            </Link>
            <nav>
                <ul>
                    <li>
                        <Link to='/IMPS/Manage-Content'>
                            <Button variant="contained" size="medium" sx={{ color: 'black', backgroundColor: 'white', '&:hover': { color: 'white', backgroundColor: 'black', }, borderColor: 'info.main', width: '100' }}>
                                Manage Content
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to='/IMPS/Sequence-Content'>
                            <Button variant="contained" size="medium" sx={{ color: 'black', backgroundColor: 'white', '&:hover': { color: 'white', backgroundColor: 'black', }, borderColor: 'info.main' }}>
                                Sequence Content
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