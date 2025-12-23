import './Skeleton.css';

export const ProductDetailSkeleton = () => {
    return (
        <div className="product-detail-skeleton">
            <div className="product-detail-skeleton__container">
                {/* Image Gallery */}
                <div className="product-detail-skeleton__gallery">
                    <div className="skeleton product-detail-skeleton__main-image"></div>
                    <div className="product-detail-skeleton__thumbnails">
                        <div className="skeleton product-detail-skeleton__thumbnail"></div>
                        <div className="skeleton product-detail-skeleton__thumbnail"></div>
                        <div className="skeleton product-detail-skeleton__thumbnail"></div>
                        <div className="skeleton product-detail-skeleton__thumbnail"></div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-detail-skeleton__info">
                    <div className="skeleton product-detail-skeleton__category"></div>
                    <div className="skeleton product-detail-skeleton__title"></div>
                    <div className="skeleton product-detail-skeleton__rating"></div>
                    <div className="skeleton product-detail-skeleton__price"></div>

                    <div className="product-detail-skeleton__description">
                        <div className="skeleton product-detail-skeleton__description-line"></div>
                        <div className="skeleton product-detail-skeleton__description-line"></div>
                        <div className="skeleton product-detail-skeleton__description-line"></div>
                        <div className="skeleton product-detail-skeleton__description-line"></div>
                    </div>

                    <div className="product-detail-skeleton__actions">
                        <div className="skeleton product-detail-skeleton__action-button"></div>
                        <div className="skeleton product-detail-skeleton__action-button"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
