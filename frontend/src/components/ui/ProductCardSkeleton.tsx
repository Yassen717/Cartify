import './Skeleton.css';

export const ProductCardSkeleton = () => {
    return (
        <div className="product-card-skeleton">
            <div className="skeleton product-card-skeleton__image"></div>
            <div className="skeleton product-card-skeleton__category"></div>
            <div className="skeleton product-card-skeleton__title"></div>
            <div className="skeleton product-card-skeleton__price"></div>
            <div className="skeleton product-card-skeleton__button"></div>
        </div>
    );
};
