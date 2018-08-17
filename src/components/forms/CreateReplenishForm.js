import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Checkbox, Select, Dropdown } from 'semantic-ui-react';
import moment from 'moment';

class CreateReplenishForm extends Component {
  initData = {
    productSku: '',
    quantity: 0,
    unitNum: 1,
  };

  state = {
    data: this.initData,
    loading: false,
    unitNumError: false,
    quantityError: false,
  }

  constructor(props) {
    super(props);

    this.quantityInputRef = React.createRef();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  static generateLineItemNo() {
    const x = parseInt(Math.random() * 10, 10);
    let lineItemNo = (moment() + x).toString();
    lineItemNo = `LIFT-${lineItemNo.substring(5, lineItemNo.length)}`;

    return lineItemNo;
  }

  handleSubmit() {
    let error = false;

    if (this.state.data.quantity <= 0) {
      this.setState({ quantityError: true });
      error = true;
    } else {
      this.setState({ quantityError: false });
    }

    if (this.state.data.unitNum <= 0) {
      this.setState({ unitNumError: true });
      error = true;
    } else {
      this.setState({ unitNumError: false });
    }

    if (error) {
      return;
    }

    // add product to list
    const selectedSku = this.state.data.productSku;
    const productObj = this.props.productListOptions.find(obj => obj.key === selectedSku);
    const data = {
      itemId: CreateReplenishForm.generateLineItemNo(),
      sku: productObj.product.sku,
      name: productObj.product.name,
      unitNum: this.state.data.unitNum,
      quantity: this.state.data.quantity,
    };

    this.props.onSubmit(data);
    this.setState({ data: this.initData });
  }

  handleFormChange(e, { name, value }) {
    this.setState(prevState => ({ data: { ...prevState.data, [name]: value } }));

    if (name === 'product') {
      this.quantityInputRef.current.inputRef.value = '';
      this.quantityInputRef.current.focus();
    }
  }

  render() {
    const { data, loading, product, unitNumError, quantityError } = this.state;
    const { productListOptions } = this.props;

    return (
      <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit} loading={loading} disabled={productListOptions.length === 0}>
        <Form.Group>
          <Form.Field>
            <label>Product</label>
            <Dropdown
              placeholder="Select Product"
              disabled={productListOptions.length === 0}
              fluid search selection
              name="productSku"
              value={data.productSku}
              options={productListOptions}
              onChange={this.handleFormChange}
            />
          </Form.Field>
          <Form.Field
            control={Input}
            required
            label="Unit Num"
            width="4"
            name="unitNum"
            value={data.unitNum}
            disabled={productListOptions.length === 0}
            onChange={this.handleFormChange}
            error={unitNumError}
          />
          <Form.Field width="4" required
            error={quantityError}
            disabled={productListOptions.length === 0}
          >
            <label>Quantity</label>
            <Input 
              name="quantity"
              value={data.quantity}
              onChange={this.handleFormChange}
              ref={this.quantityInputRef}
            />
          </Form.Field>
        </Form.Group>
        <Form.Field
          control={Button}
          className="submit-btn"
          disabled={productListOptions.length === 0}>
          Add Product
        </Form.Field>
      </Form>
    );
  }
}

CreateReplenishForm.propTypes = {
  productListOptions: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateReplenishForm;
