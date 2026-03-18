import BookSearch from '../features/book-search/BookSearch';
import styles from './HomePage.module.css';

const HomePage = () => {
    return (
        <div className={styles.homeContent}>
            <BookSearch />
        </div>
    );
};

export default HomePage;
