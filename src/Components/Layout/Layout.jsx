import MainNavigation from './MainNavigation';
import PropTypes from 'prop-types';


//Function handling layout of general menu.
function Layout(props) {
    return (
        <div>
            <MainNavigation />
            <main>
                {props.children}
            </main>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;