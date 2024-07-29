import MainNavigation from './MainNavigation';
import PropTypes from 'prop-types';


/**
 * Layout component handles the general layout of the application.
 * It includes the MainNavigation component and renders any children passed to it.
 */
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