import React from 'react';
import PropTypes from 'prop-types';
import { Image, Label } from 'semantic-ui-react';
import './ProductInfoDisplay.css';
import ImageNotFound from '../../../assets/images/no_photo_available.jpg';

const productImgBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL;

const ProductInfoDisplay = ({ product, pickedAmount, quantity, currentBarcode }) => {
  const imageUrl = `${productImgBaseUrl}${product.productID}.png`;

  return (
    <div className="product-info-block">
      <div className="product-remain-container">
        <span className="remain-amount">
          {quantity - pickedAmount}
        </span>
        <div className="remain-unit">
          {quantity - pickedAmount > 1 ? 'items' : 'item'}
        </div>
      </div>
      <div className="product-info-container">
        <div className="product-image-container">
          <Image className="product-image" src={imageUrl} onError={(e) => { e.target.src = ImageNotFound; }} />
        </div>

        <div className="product-name-container">
          <span className="product-name">
            {product.productName}
          </span>
          <br />
          <br />
          <Label size="huge">
            {currentBarcode}
          </Label>
        </div>
      </div>
    </div>
  );
};

ProductInfoDisplay.propTypes = {
  product: PropTypes.object.isRequired,
  quantity: PropTypes.number.isRequired,
  pickedAmount: PropTypes.number.isRequired,
  currentBarcode: PropTypes.string.isRequired,
};

export default ProductInfoDisplay;
