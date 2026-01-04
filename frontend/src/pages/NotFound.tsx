import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import './NotFound.css';

export const NotFound = () => {
    return (
        <div className="not-found">
            <div className="not-found-container">
                <motion.div
                    className="not-found-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="not-found-code">404</div>
                    <h1 className="not-found-title">Page Not Found</h1>
                    <p className="not-found-message">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                    
                    <div className="not-found-actions">
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Button variant="primary" size="lg">
                                <FiHome /> Go Home
                            </Button>
                        </Link>
                        <Link to="/products" style={{ textDecoration: 'none' }}>
                            <Button variant="outline" size="lg">
                                <FiSearch /> Browse Products
                            </Button>
                        </Link>
                    </div>

                    <button 
                        className="not-found-back"
                        onClick={() => window.history.back()}
                    >
                        <FiArrowLeft /> Go Back
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
