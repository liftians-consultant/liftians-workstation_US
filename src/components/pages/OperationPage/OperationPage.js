import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button } from 'semantic-ui-react';
import api from '../../../api';
import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
// import RemainPickAmount from "./components/RemainPickAmount/RemainPickAmount";
import './OperationPage.css';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';
import PickBoxes from './components/PickBoxes/PickBoxes';

class OperationPage extends Component {

  state = {
    podInfo: {
      podId: '',
      shelfBoxes: []
    },
    currentPickProduct: {},
    pickedAmount: 0,
    loading: false,
    barcode: '',
    showBox: false
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
      this.setState({ podInfo, pickedAmount: 0, loading: false })
    }).catch( err => {
      console.error('error getting pod info', err);
    });
  }

  getProductList() {
    api.pick.atStationBoxLocation(this.props.stationId).then(res => {
      console.log(res.data);
      this.setState({ currentPickProduct: res.data[0] });
    }).catch((err) => {
      console.error('Error getting products list', err);
    });
  }

  handleScanBtnClick() {
    this.setState( { showBox: !this.state.showBox });
  }

  render() {
    const { podInfo, currentPickProduct, pickedAmount, showBox } = this.state;
    const highlightBox = {
      row: parseInt(currentPickProduct.shelfID, 10),
      column: parseInt(currentPickProduct.holderPosition, 10)
    };

    return (
      <div className="operationPage">
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment.Group>
                <Segment>
                  <PodShelf podInfo={ podInfo } highlightBox={ highlightBox }></PodShelf>
                </Segment>
              </Segment.Group>
            </Grid.Column>

            <Grid.Column width={11}>
              { !showBox ? (
                <div>
                  <ProductInfoDisplay product={ currentPickProduct } pickedAmount={ pickedAmount }></ProductInfoDisplay>
                  <br></br>
                </div>
              ) : (
                <div>
                  <PickBoxes openedBoxNum={ parseInt(currentPickProduct.boxID, 10) }></PickBoxes>
                  <NumPad></NumPad>
                </div>
              ) }
              <Button primary size="huge" onClick={ () => this.handleScanBtnClick() }>Scan</Button>

              
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