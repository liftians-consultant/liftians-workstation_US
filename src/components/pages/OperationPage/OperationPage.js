import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button, Portal, Header, Dimmer, Loader } from 'semantic-ui-react';
import api from '../../../api';
import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
// import RemainPickAmount from "./components/RemainPickAmount/RemainPickAmount";
import './OperationPage.css';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';
import BinGroup from './components/BinGroup/BinGroup';
import OrderDetailListModal from './components/OrderDetailListModal/OrderDetailListModal';
import OrderFinishModal from './components/OrderFinishModal/OrderFinishModal';
import WrongProductModal from './components/WrongProductModal/WrongProductModal';

class OperationPage extends Component {

  state = {
    podInfo: {
      podId: '',
      shelfBoxes: []
    },
    currentPickProduct: {
      quantity: 0
    },
    orderList: [],
    pickedAmount: 0,
    loading: true,
    barcode: '',
    showBox: false,
    openOrderFinishModal: false,
    openWrongProductModal: false
    
  }

  checkPodInterval = {};
  
  finishedOrder = {
    binNum: 3,
    orderNo: '235345'
  };

  constructor(props) {
    super(props)

    // Bind the this context to the handler function
    this.selectPickedAmount = this.selectPickedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.closeOrderFinishModal = this.closeOrderFinishModal.bind(this);
    this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    // this.handleWrongProductBtnClick = this.handleWrongProductBtnClick.bind(this);
  }

  componentWillMount() {
    this.getUpcomingPod();
    // this.retrieveNextOrder();
  }

  componentWillUnmount() {
    clearInterval(this.checkPodInterval);
  }

  selectPickedAmount(num) {
    this.setState({ pickedAmount: this.state.pickedAmount + num }, () => {
      if (this.state.pickedAmount === parseInt(this.state.currentPickProduct.quantity, 10)) {
        this.finishPick();
      }
    });
  }

  getUpcomingPod() {
    // TODO: add simulation mode to .env
    let isRecieve = false;

    this.checkPodInterval = setInterval( () => {
      if (!isRecieve) {
        api.station.atStationPodLayoutInfo(this.props.stationId).then( res => {
          if (res.data.length > 0) {
            console.log('Pod arrive station');
            this.setState({ orderProductList: res.data }, () => isRecieve = true);
          }
        });
      } else {
        console.log('stop interval');
        clearInterval(this.checkPodInterval);
        this.retrieveNextOrder();
      }
    }, 1500);
  }

  finishPick() {
    const product = this.state.currentPickProduct;
    const data = {
      stationId: this.props.stationId,
      shelfId: product.shelfID,
      boxId: product.boxID,
      orderNo: product.order_no,
      sourceLinesId: product.source_lines_id,
      productId: product.productID,
      lotNo: product.lot_no,
      packageBarcode: this.state.barcode,
      pickQuantity: this.state.pickedAmount,
      taskSubtype: product.locate_act_type,
      shortQty: parseInt(product.quantity, 10) - this.state.pickedAmount,
    }

    api.pick.atStationAfterPickProduct(data).then(res => {
      if (res.data) { // return 1 if success
        // this.setState({ showBox: false }, () => this.retrieveNextOrder());
        data.holderId = this.state.currentPickProduct.holderID;
        
        // after placed in bin, inform db
        api.pick.atHolderAfterPickProduct(data).then( res => {
          // set here because avoid data changed after async call
          this.finishedOrder = {
            orderNo: this.state.currentPickProduct.order_no,
            binNum: parseInt(this.state.currentPickProduct.binPosition, 10)
          };
          this.checkIsOrderFinished();
          this.retrieveNextOrder();
        })
      } else {
        // TODO: ERROR MESSAGE
      }
    }).catch((err) => {
      console.error('Error for atStationAfterPickProduct', err);
    });
  }

  retrieveNextOrder() {
    this.getPodInfo();
    this.getProductList();
  }

  checkIsOrderFinished() {
    api.pick.checkIsOrderFinished(this.state.currentPickProduct.order_no).then( res => {
      if (res.data) { // return 1 or 0
        console.log("order finished");
        this.setState({ openOrderFinishModal: true });
      }
    });
  }

  getPodInfo() {
    this.setState({ loading: true });
    api.station.atStationPodLayoutInfo(this.props.stationId).then(res => {
      // console.log(res.data);
      if (res.data.length) {
        const podInfo = {
          podId: res.data[0].podid,
          podSide: res.data[0].podSide,
          taskType: res.data[0].taskType,
          shelfBoxes: _.chain(res.data).sortBy('shelfId').map((elmt) => { return parseInt(elmt.maxBox, 10) }).reverse().value()
        }
        this.setState({ podInfo, loading: false })
      }     
    }).catch( err => {
      console.error('error getting pod info', err);
    });
  }

  getProductList() {
    api.pick.atStationBoxLocation(this.props.stationId).then(res => {
      console.log(res.data);
      if (res.data.length) {
        this.setState({ 
          currentPickProduct: res.data[0],
          orderList: res.data,
          pickedAmount: 0,
          showBox: false });
      } else {
        // when nothing return, that means the pod is finished
        // and need to wait for the next pod come in to station
        console.log("No order return from the server");
        this.getUpcomingPod(); 
      }
    }).catch((err) => {
      console.error('Error getting products list', err);
    });
  }

  scanValidation(barcode) {
    if (barcode === this.state.currentPickProduct.productID) {
      return true;
    } else {
      return false;
    }
  }

  handleScanBtnClick() {
    if (!this.state.showBox) {
      // TODO: SIMULATION ONLY! NO PRODUCTION
      const data = {
        podId: this.state.currentPickProduct.podID,
        podSide: this.state.currentPickProduct.podSide,
        shelfId: this.state.currentPickProduct.shelfID,
        boxId: this.state.currentPickProduct.boxID,
      };
      api.pick.getProductSerialNum(data).then( res => {
        this.setState({ showBox: !this.state.showBox, barcode: res.data[0].barcode });
      });

      /* PRODUCTION CODE */
      // After get barcode from scanner
      // if (this.scanValidation(something)) {
      //   this.setState({ showBox: !this.state.showBox, barcode: res.data[0].barcode });
      // }

    } else {
      this.setState({ barcode: ''});
    }
  }

  handleWrongProductBtnClick() {
    // const wrongBarcode = "191618";

    const data = {
      podId: this.state.currentPickProduct.podID,
      podSide: this.state.currentPickProduct.podSide,
      shelfId: 2,
      boxId: 1,
    };

    //  TODO: THE FOLLWING CODE IS JUST TRYIGN TO MAKE THE SIMULATION WORK....
    api.pick.getProductSerialNum(data).then( res => {
      this.setState({ barcode: res.data[1].barcode }, () => {
        if (!this.scanValidation(res.data[1].barcode)) {
          this.setState({ openWrongProductModal: true });
        }
      });      
    });

    
  }

  closeOrderFinishModal() {
    this.setState({ openOrderFinishModal: false });
  }

  closeWrongProductModal() {
    this.setState({ openWrongProductModal: false });
  }

  render() {
    const { podInfo, currentPickProduct, pickedAmount, showBox, 
      orderList, openOrderFinishModal, openWrongProductModal, barcode } = this.state;
    const highlightBox = {
      row: currentPickProduct ? parseInt(currentPickProduct.shelfID, 10) : 0,
      column: currentPickProduct ? parseInt(currentPickProduct.boxID, 10) : 0
    };

    return (
      <div className="operationPage">
        <Dimmer active={this.state.loading}>
          <Loader content='Waiting for pod...' indeterminate size="massive"/>
        </Dimmer>
        <Grid>
          <Grid.Row >
            <Grid.Column width={5}>
              <div className="pod-info-block">
                <span>Pod #{ podInfo.podId }, </span><span>Side #{ podInfo.podSide }</span>
              </div>
              <Segment.Group>
                <Segment>
                  <PodShelf podInfo={ podInfo } highlightBox={ highlightBox }></PodShelf>
                </Segment>
              </Segment.Group>
              { orderList.length > 0 && <OrderDetailListModal orderList={ orderList } /> }
              <Button color="red" onClick={ () => this.finishPick() }>Shortage</Button>
            </Grid.Column>

            <Grid.Column width={11}>
              { !showBox ? (
                <div>
                  <ProductInfoDisplay product={ currentPickProduct } pickedAmount={ pickedAmount }></ProductInfoDisplay>
                  <br></br>
                  <Button primary size="massive" onClick={ () => this.handleScanBtnClick() }>Scan</Button>
                  <Button size="medium" onClick={ () => this.handleWrongProductBtnClick() }>Simulate wrong scan</Button>
                </div>
              ) : (
                <div>
                  <BinGroup openedBinNum={ parseInt(currentPickProduct.binPosition, 10) }></BinGroup>
                  <NumPad highlightAmount={ currentPickProduct.quantity - pickedAmount }
                    callback={this.selectPickedAmount}
                    ></NumPad>
                </div>
              ) }
            </Grid.Column>
          </Grid.Row>
        </Grid>

        { openOrderFinishModal && <OrderFinishModal data={ this.finishedOrder }
          modalOpen={ openOrderFinishModal }
          modalClose={ this.closeOrderFinishModal }
          ></OrderFinishModal> }

        { openWrongProductModal && <WrongProductModal podInfo={ podInfo } 
          productId={ barcode }
          open={ openWrongProductModal }
          close={ this.closeWrongProductModal } /> }
      </div>
    );
  }
}

OperationPage.propTypes = {
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  }
}
export default connect(mapStateToProps, {})(OperationPage);