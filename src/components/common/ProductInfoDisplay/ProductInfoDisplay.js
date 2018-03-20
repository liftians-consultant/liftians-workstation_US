import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';
import './ProductInfoDisplay.css';

class ProductInfoDisplay extends Component {

  render() {
    const { product, pickedAmount } = this.props;
    return (
      <div className="product-info-block">
        <div className="product-name-container">
          <span className="product-name">{ product.productName }</span>
        </div>
        <div className="product-remain-container">
          <span className="remain-amount">{ product.quantity - pickedAmount }</span>
        </div>
        <div className="product-image-container">
          <Image src="http://via.placeholder.com/500x400"></Image>
        </div>
      </div>
    );
  }
}

ProductInfoDisplay.propTypes = {
  product: PropTypes.object.isRequired,
  pickedAmount: PropTypes.number.isRequired,
};

export default ProductInfoDisplay;