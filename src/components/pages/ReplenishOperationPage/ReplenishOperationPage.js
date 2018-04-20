import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button, Dimmer, Loader, Image } from 'semantic-ui-react';
import api from '../../../api';
// import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';
import './ReplenishOperationPage.css';
import WarningModal from '../../common/WarningModal/WarningModal';

// const testProduct = [
//   {
//     taskType: "R",
//     stationID: 1,
//     podID: 20,
//     podSide: 0,
//     shelfID: 1,
//     boxId: 1,
//     replenishBillNo: "T1712060003",
//     source_id: "818241",
//     source_lines_id: "829777",
//     productId: "096719",
//     productName: "Something that is awesome",
//     lot_no: "A20171202",
//     unit_num: "12",
//     expire_date: "2018-12-06 00:00:00.0",
//     totalReplenishQuantity: 3,
//     locate_act_type: "D"
//   }
// ]
class ReplenishOperationPage extends Component {

  state = {
    businessMode: process.env.REACT_APP_BUSINESS_MODE,
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: []
    },
    currentReplenishProduct: {
      totalReplenishQuantity: 0
    },
    taskId: 0,
    orderList: [],
    replenishedAmount: 0,
    loading: true,
    barcodeList: [],
    barcode: '',
    boxBarcode: 0,
    // showBox: false,
    // openOrderFinishModal: false,
    openWrongProductModal: false,
    nextPod: {
      
    }
    
  }

  checkPodInterval = {};
  
  finishedOrder = {
    binNum: 3,
    orderNo: '235345'
  };

  constructor(props) {
    super(props)

    // Bind the this context to the handler function
    this.selectReplenishedAmount = this.selectReplenishedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleProductScanBtnClick = this.handleProductScanBtnClick.bind(this);
    this.finishReplenish = this.finishReplenish.bind(this);
    // this.closeOrderFinishModal = this.closeOrderFinishModal.bind(this);
    // this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    // this.handleWrongProductBtnClick = this.handleWrongProductBtnClick.bind(this);
  }

  componentWillMount() {
    this.getUpcomingPod();
  }

  componentWillUnmount() {
    clearInterval(this.checkPodInterval);
  }

  selectReplenishedAmount(num) {
    this.setState({ replenishedAmount: this.state.replenishedAmount + num }, () => {
      this.finishReplenish(num);
    });
  }

  getUpcomingPod() {
    // TODO: add simulation mode to .env
    let isRecieve = false;
    this.setState({ loading: true });
    this.checkPodInterval = setInterval( () => {
      if (!isRecieve) {
        api.station.atStationTask(this.props.stationId).then( res => {
          if (res.data > 0) {
            console.log(`Pod arrive station with TaskId ${res.data}`);
            this.setState({ orderProductList: res.data, taskId: res.data }, () => isRecieve = true);
          }
        });
      } else {
        // console.log('stop interval');
        clearInterval(this.checkPodInterval);
        this.retrieveNextOrder();
      }
    }, 1500);
  }

  finishReplenish(replenishAmount, isNextPod=false) {
    this.setState({ loading: true });
    const product = this.state.currentReplenishProduct;
    let barcodeList = this.state.barcode;
    if (this.state.businessMode === 'pharmacy' ) {
      barcodeList = this.state.barcodeList.slice(0, replenishAmount).join(',');
    }
    const data = {
      taskId: this.state.taskId,
      boxBarcode: this.state.boxBarcode,
      sourceLinesId: product.source_lines_id,
      productId: product.productID,
      productBarcodeList: barcodeList,
      replenishQty: replenishAmount,
      locateActType: product.locate_act_type,
    };

    console.log("Replenish data", data);
    api.replenish.atStationSubmitReplenishProduct(data).then(res => {
      if (res.data) { // return 1 if success
        console.log('REPLENISH success');

        if (isNextPod) {
          api.station.forcePodToLeaveStationByTaskId(this.props.stationId, this.state.taskId).then(res => {
            console.log(`Force Pod with TaskId ${this.state.taskId} to leave`);
            this.getUpcomingPod();
          });
          return;
        }

        if (this.state.replenishedAmount === parseInt(this.state.currentReplenishProduct.totalReplenishQuantity, 10)) {
          this.retrieveNextOrder();
        }
      } else {
        // TODO: ERROR MESSAGE
        console.log('REPLENISH falied');
        this.setState({ loading: false });
      }
    }).catch((err) => {
      console.error('Error for atStationAfterReplenishProduct', err);
    });
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
    this.getProductList();
    // this.getPodInfo();
  }

  getPodInfo() {
    console.log('current replenishing product', this.state.currentReplenishProduct);

    this.getProductBarcodeList(); // SIMULATION: GET BARCODE

    api.station.atStationPodLayoutInfo(this.state.podInfo.podId, this.state.podInfo.podSide).then(res => {
      // console.log(res.data);
      if (res.data.length) {
        const podInfo = {
          ...this.state.podInfo,
          shelfBoxes: _.chain(res.data).sortBy('shelfID').map((elmt) => { return parseInt(elmt.maxNumberOfBox, 10) }).reverse().value()
        }
        this.setState({ podInfo, loading: false })
      }     
    }).catch( err => {
      console.error('error getting pod info', err);
    });
  }

  getProductList() {
    api.replenish.getReplenishInfoByTaskId(this.state.taskId).then(res => {
      // console.log(res.data);
      // res.data = testProduct;
      if (res.data.length) {
        this.setState({ 
          currentReplenishProduct: res.data[0],
          orderList: res.data,
          podInfo: {
            podId: res.data[0].podID,
            podSide: res.data[0].podSide,
            shelfBoxes: []
          },
          replenishedAmount: 0,
          boxBarcode: 0
        }, this.getPodInfo);
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
    if (barcode === this.state.currentReplenishProduct.productID) {
      return true;
    } else {
      return false;
    }
  }

  getProductBarcodeList(callback) {
    const { productID, source_lines_id } = this.state.currentReplenishProduct;
    api.replenish.getProductInfoByTaskId(this.state.taskId, source_lines_id, productID, 100).then( res => {
      if (res.data) {
        const barcodeList = res.data.map(item => item.productBarCode)
        console.log('barcode list: ', barcodeList);

        this.setState({ barcodeList: barcodeList});
      }
      
      if (callback) {
        callback();
      }
    }).catch( err => {
      console.log("ERROR WHILE GETTING BARCODE LIST", err);
    });
  }

  /* Simulate when the user scan the product */
  handleProductScanBtnClick() {
    // TODO: SIMULATION ONLY! NO PRODUCTION
    if (this.state.businessMode === 'pharmacy') {
      // all product have unique barcode. scann all product then send out the finish request
      
      this.setState({ replenishedAmount: this.state.replenishedAmount + 1 }, () => {
        console.log(`SCAN PRODUCT: Replenished amount: ${this.state.replenishedAmount}`);
        if (this.state.replenishedAmount === this.state.currentReplenishProduct.totalReplenishQuantity) {
          this.finishReplenish(this.state.replenishedAmount);
        }
      });
    } else if (this.state.businessMode === 'ecommerce' ) {
      // only one barcode will be return and all product use same barcode
      // scanned once, send request everything number pad is clicked. 
      console.log('ecommerce scanned~');
      this.setState({ barcode: this.state.barcodeList[0]});
    }

    /* PRODUCTION CODE */
    // After get barcode from scanner
    // if (this.scanValidation(something)) {
    //   this.setState({ showBox: !this.state.showBox, barcode: res.data[0].barcode });
    // } else {
    //   this.setState({ openWrongProductModal: true });
    // }
  }

  /* Simulate when user scan the box barcode */
  handleScanBoxClick() {
    const productInfo = this.state.currentReplenishProduct;
    // generate box barcode
    const boxBarcode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
    console.log(`SCAN BOX: ${boxBarcode}`);
    this.setState({ boxBarcode });

    /* PRODUCTION */

  }

  handleNextPodBtnClick() {
    this.finishReplenish(this.state.replenishedAmount, true);
  }

  handleWrongProductBtnClick() {
    // const wrongBarcode = "191618";

    // const data = {
    //   podId: this.state.currentReplenishProduct.podID,
    //   podSide: this.state.currentReplenishProduct.podSide,
    //   shelfId: 2,
    //   boxId: 1,
    // };

    //  TODO: THE FOLLWING CODE IS JUST TRYIGN TO MAKE THE SIMULATION WORK....
    // api.pick.getProductSerialNum(data).then( res => {
    //   this.setState({ barcode: res.data[1].barcode }, () => {
    //     if (!this.scanValidation(res.data[1].barcode)) {
          this.setState({ openWrongProductModal: true });
    //     }
    //   });      
    // });
 
  }

  // closeOrderFinishModal() {
  //   this.setState({ openOrderFinishModal: false });
  // }

  // closeWrongProductModal() {
  //   this.setState({ openWrongProductModal: false });
  // }

  render() {
    const { podInfo, currentReplenishProduct, replenishedAmount, barcode, boxBarcode } = this.state;
    const highlightBox = {
      row: currentReplenishProduct ? parseInt(currentReplenishProduct.shelfID, 10) : 0,
      column: currentReplenishProduct ? parseInt(currentReplenishProduct.boxID, 10) : 0
    };

    return (
      <div className="replenish-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content='Waiting for pod...' indeterminate size="massive"/>
        </Dimmer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <div className="pod-info-block">
                <span>Pod #{ podInfo.podId } </span><span>- { podInfo.podSide }</span>
              </div>
              <Segment.Group>
                <Segment>
                  <PodShelf podInfo={ podInfo } highlightBox={ highlightBox }></PodShelf>
                </Segment>
              </Segment.Group>

              <div>
                <Button>Shortage</Button>
                <WarningModal triggerText='Scan Wrong Box'
                  headerText='Wrong Box'
                  contentText='You scanned a wrong box! Please make sure you locate the right box and try again.'
                />

                <WarningModal triggerText='Scan Wrong Product'
                  headerText='Wrong Product'
                  contentText='You scanned a wrong product! Please make sure you have the right product and try again.'
                />
              </div>

              {/* { orderList.length > 0 && <OrderDetailListModal orderList={ orderList } /> } */}
              {/* <Button color="red" onClick={ () => this.finishReplenish() }>Shortage</Button> */}
            </Grid.Column>

            <Grid.Column width={11}>
              {/* { showBox === false ? ( */}
                <div>
                  {/* <ProductInfoDisplay product={ currentReplenishProduct } quantity={ currentReplenishProduct.totalReplenishQuantity } pickedAmount={ replenishedAmount }></ProductInfoDisplay> */}
                  <div className="product-info-block">
                    <div className="product-name-container">
                      <span className="product-name">{ currentReplenishProduct.productName }</span>
                    </div>
                    <div className="product-remain-container">
                      <span className="remain-amount">{ currentReplenishProduct.totalReplenishQuantity }</span>
                    </div>
                    <div className="product-image-container">
                      <Image className="product-image" src="http://via.placeholder.com/400x300"></Image>
                    </div>
                  </div>
                  <br></br>
                  <Button primary size="medium" onClick={ () => this.handleScanBoxClick() }>Scan Box</Button>
                  <Button primary size="medium" onClick={ () => this.handleProductScanBtnClick() } disabled={ this.state.boxBarcode === 0 } >Scan Product</Button>
                  <br></br>
                    <Button size="medium" onClick={ () => this.handleNextPodBtnClick() }>Next Pod</Button>

                  { this.state.businessMode === 'ecommerce' && <NumPad highlightAmount={ currentReplenishProduct.totalReplenishQuantity - replenishedAmount }
                    callback={this.selectReplenishedAmount}
                    disabled={ barcode === '' || boxBarcode === '' }></NumPad> }
                </div>
              {/* ) : (
               
              ) } */}
            </Grid.Column>
          </Grid.Row>
        </Grid>

      </div>
    );
  }
}

ReplenishOperationPage.propTypes = {
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  }
}

export default connect(mapStateToProps, {})(ReplenishOperationPage);