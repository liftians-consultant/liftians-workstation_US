import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid } from 'semantic-ui-react';
import api from '../../../api';
import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
// import RemainPickAmount from "./components/RemainPickAmount/RemainPickAmount";
import './OperationPage.css';

class OperationPage extends Component {

  state = {
    podInfo: {
      podId: '',
      shelfBoxes: []
    },
    currentPickProduct: {},
    remainPickAmount: 0,
    loading: false
  }

  componentWillMount() {
    this.getAtStationPodInfo();
    this.getProductList();
  }

  getAtStationPodInfo() {
    this.setState({ loading: true });
    api.station.atStationPodLayoutInfo(this.props.stationId).then(res => {
      // console.log(res.data);
      const podInfo = {
        podId: res.data[0].podid,
        podSide: res.data[0].podSide,
        taskType: res.data[0].taskType,
        shelfBoxes: _.chain(res.data).sortBy('shelfId').map((elmt) => { return parseInt(elmt.maxBox, 10) }).reverse().value()
      }
      this.setState({ podInfo, remainPickAmount: 0, loading: false })
    }).catch( err => {
      console.error('error getting pod info', err);
    });
  }

  getProductList() {
    api.pick.atStationBoxLocation(this.props.stationId).then(res => {
      console.log(res.data);
      this.setState({ currentPickProduct: res.data[0], remainPickAmount: parseInt(res.data[0].quantity, 10) });
    }).catch((err) => {
      console.error('Error getting products list', err);
    });
  }

  render() {
    const { podInfo, currentPickProduct, remainPickAmount } = this.state;
    
    // create shelf html
    const shelfElement = podInfo.shelfBoxes.map( (boxAmount, index) => {
        let shelfObject = [];
        _.times(boxAmount, (i) => {
          shelfObject.push( <div key={'shelf'+ index + 'box'+ i} className={'shelf-object shelf-row-' + (index + 1) } style={{ width: 1 / boxAmount * 100 + '%' }}></div> )
        })
      
      return (<div className="shelf-row" key={ index }>{ shelfObject }</div>)
    })

    return (
      <div className="operationPage">
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment.Group>
                <Segment>
                  {shelfElement}
                </Segment>
              </Segment.Group>
            </Grid.Column>

            <Grid.Column width={11}>
              <ProductInfoDisplay product={ currentPickProduct } remainPickAmount={ remainPickAmount }></ProductInfoDisplay>
              {/* <RemainPickAmount ></RemainPickAmount> */}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

OperationPage.propTypes = {
  stationId: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  }
}
export default connect(mapStateToProps, {})(OperationPage);