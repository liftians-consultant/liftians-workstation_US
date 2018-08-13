import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Dimmer, Loader, Select, Button, Input } from 'semantic-ui-react';

class GenerateProductPage extends Component {
  state = {};

  render() {
    return (
      <div className="generate-product-page">
        <Dimmer active={this.state.isLoading}>
          <Loader content="Loading" />
        </Dimmer>
        {/* <Form inverted widths="equal" size="small" onSubmit={this.handleSubmit }>
          <Form.Group>
            <Form.Field control={Select} label="Type" name="type" value={type} options={productTypeOptions} onChange={this.handleFormChange} />
            <Form.Field control={Select} label="Catalog" name="category" value={category} options={productCategoryOptions} onChange={this.handleFormChange} />
          </Form.Group>
          <Form.Group>
            <Form.Field control={Input} label="Product ID" name="productId" value={productId} onChange={this.handleFormChange} />
            <Form.Field control={Input} label="Product Name" name="productName" value={productName} onChange={this.handleFormChange} />
            <Form.Field control={Select} label="Expire Date" name="expireDate" value={expireDate} options={expirationDateOptions} onChange={this.handleFormChange} />
            <Form.Field control={Button} primary className="submit-btn">Submit</Form.Field>
            <Button type="button" className="reset-btn" onClick={this.resetForm}>Reset</Button>
          </Form.Group>
        </Form> */}
      </div>
    );
  }
}

GenerateProductPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default GenerateProductPage;
