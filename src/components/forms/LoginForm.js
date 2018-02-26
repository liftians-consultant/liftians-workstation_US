import React from "react";
import PropTypes from "prop-types";
import { Form, Button, Message, Segment } from "semantic-ui-react";
import Validator from "validator";
import InlineError from "../messages/InlineError";

class LoginForm extends React.Component {
  state = {
    data: {
      username: "",
      password: ""
    },
    loading: false,
    errors: {}
  };

  onChange = e =>
    this.setState({
      data: { ...this.state.data, [e.target.name]: e.target.value }
    });

  onSubmit = () => {
    const errors = this.validate(this.state.data);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.setState({ loading: true });
      this.props
        .submit(this.state.data)
        .catch(err =>
          {
            console.log(err);
            this.setState({ errors: { global: 'Login Error'}, loading: false })
          }
        );
    }
  };

  validate = data => {
    const errors = {};
    if (!data.password) errors.password = "Can't be blank";
    return errors;
  };

  render() {
    const { data, errors, loading } = this.state;

    return (

      // <Form size='large'>
      //       <Segment stacked>
      //         <Form.Input
      //           fluid
      //           icon='user'
      //           iconPosition='left'
      //           placeholder='E-mail address'
      //         />
      //         <Form.Input
      //           fluid
      //           icon='lock'
      //           iconPosition='left'
      //           placeholder='Password'
      //           type='password'
      //         />

      //         <Button color='teal' fluid size='large'>Login</Button>
      //       </Segment>
      //     </Form>


      <Form onSubmit={this.onSubmit} loading={loading} size='large'>
        <Segment>
        {errors.global && (
          <Message negative>
            <Message.Header>Something went wrong</Message.Header>
            <p>{errors.global}</p>
          </Message>
        )}
        <Form.Field fluid="true" error={!!errors.email}>
          {/* <label htmlFor="username">Username</label> */}
          <input
            type="text"
            id="username"
            name="username"
            placeholder="your username"
            value={data.username}
            onChange={this.onChange}
          />
          {errors.username && <InlineError text={errors.email} />}
        </Form.Field>
        <Form.Field fluid="true" error={!!errors.password}>
          {/* <label htmlFor="password">Password</label> */}
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Make it secure"
            value={data.password}
            onChange={this.onChange}
          />
          {errors.password && <InlineError text={errors.password} />}
        </Form.Field>
        <Button primary>Login</Button>
        </Segment>
      </Form>
    );
  }
}

LoginForm.propTypes = {
  submit: PropTypes.func.isRequired
};

export default LoginForm;
