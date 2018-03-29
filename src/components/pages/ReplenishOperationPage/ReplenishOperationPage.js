import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button, Dimmer, Loader, Modal } from 'semantic-ui-react';
import api from '../../../api';
import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';

const testProduct = [
  {
    taskType: "R",
    stationID: 1,
    podID: 20,
    podSide: 0,
    shelfID: 1,
    boxId: 1,
    replenishBillNo: "T1712060003",
    source_id: "818241",
    source_lines_id: "829777",
    productId: "096719",
    productName: "Something that is awesome",
    lot_no: "A20171202",
    unit_num: "12",
    expire_date: "2018-12-06 00:00:00.0",
    totalReplenishQuantity: 3,
    locate_act_type: "D"
  }
]
class ReplenishOperationPage extends Component {

  state = {
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
    barcode: '',
    boxBarcode: 0,
    // showBox: false,
    // openOrderFinishModal: false,
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
    this.selectReplenishedAmount = this.selectReplenishedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleScanBtnClick = this.handleScanBtnClick.bind(this);
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

    this.checkPodInterval = setInterval( () => {
      if (!isRecieve) {
        api.station.atStationTask(this.props.stationId).then( res => {
          if (res.data > 0) {
            console.log('Pod arrive station');
            this.setState({ orderProductList: res.data, taskId: res.data }, () => isRecieve = true);
          }
        });
      } else {
        console.log('stop interval');
        clearInterval(this.checkPodInterval);
        this.retrieveNextOrder();
      }
    }, 1500);
  }

  finishReplenish(replenishAmount) {
    const product = this.state.currentReplenishProduct;
    const data = {
      stationId: this.props.stationId,
      boxBarcode: this.state.boxBarcode,
      productId: product.productID,
      lotNo: product.lot_no,
      packageCodes: this.state.barcode,
      quantity: replenishAmount,
      taskSubtype: product.locate_act_type,
      // isBoxFull: parseInt(product.quantity, 10) - this.state.replenishedAmount,
    }

    api.replenish.atStationAfterReplenishProduct(data).then(res => {
      if (res.data) { // return 1 if success
        // this.setState({ showBox: false }, () => this.retrieveNextOrder());
        data.holderId = this.state.currentReplenishProduct.holderID;
        
          this.finishedOrder = {
            orderNo: this.state.currentReplenishProduct.order_no,
            binNum: parseInt(this.state.currentReplenishProduct.binPosition, 10)
          };

          if (this.state.replenishedAmount === parseInt(this.state.currentReplenishProduct.quantity, 10)) {
            this.retrieveNextOrder();
          }

      } else {
        // TODO: ERROR MESSAGE
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
      console.log(res.data);
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

  /* Simulate when the user scan the product */
  handleScanBtnClick() {
    if (!this.state.showBox) {
      // TODO: SIMULATION ONLY! NO PRODUCTION
      const data = {
        podId: this.state.currentReplenishProduct.podID,
        podSide: this.state.currentReplenishProduct.podSide,
        shelfId: this.state.currentReplenishProduct.shelfID,
        boxId: this.state.currentReplenishProduct.boxID,
      };
      api.pick.getProductSerialNum(data).then( res => {
        this.setState({ barcode: res.data[0].barcode });
      });

      /* PRODUCTION CODE */
      // After get barcode from scanner
      // if (this.scanValidation(something)) {
      //   this.setState({ showBox: !this.state.showBox, barcode: res.data[0].barcode });
      // } else {
      //   this.setState({ openWrongProductModal: true });
      // }

    } else {
      this.setState({ barcode: ''});
    }
  }

  /* Simulate when user scan the box barcode */
  handleScanBoxClick() {
    const productInfo = this.state.currentReplenishProduct;
    // generate box barcode
    const boxBarcode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
    console.log(`set boxBarcode ${boxBarcode}`);
    this.setState({ boxBarcode });

    /* PRODUCTION */

  }

  handleNextPodBtnClick() {
    api.replenish.atStationForcePodToLeave(this.props.stationId, this.currentReplenishProduct.podID).then(res => {
      this.getUpcomingPod();
    });
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
    const { podInfo, currentReplenishProduct, replenishedAmount, 
      orderList, openOrderFinishModal, openWrongProductModal, barcode, boxBarcode } = this.state;
    const highlightBox = {
      row: currentReplenishProduct ? parseInt(currentReplenishProduct.shelfID, 10) : 0,
      column: currentReplenishProduct ? parseInt(currentReplenishProduct.boxID, 10) : 0
    };

    return (
      <div className="operationPage">
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
              {/* { orderList.length > 0 && <OrderDetailListModal orderList={ orderList } /> } */}
              {/* <Button color="red" onClick={ () => this.finishReplenish() }>Shortage</Button> */}
            </Grid.Column>

            <Grid.Column width={11}>
              {/* { showBox === false ? ( */}
                <div>
                  <ProductInfoDisplay product={ currentReplenishProduct } quantity={ currentReplenishProduct.totalReplenishQuantity } pickedAmount={ replenishedAmount }></ProductInfoDisplay>
                  <br></br>
                  <Button primary size="huge" onClick={ () => this.handleScanBoxClick() }>Scan Box</Button>
                  <Button primary size="huge" onClick={ () => this.handleScanBtnClick() } disabled={ this.state.boxBarcode === 0 } >Scan Product</Button>
                  <Button size="huge" onClick={ () => this.handleNextPodBtnClick() }>Next Pod</Button>

                  <div>
                    <Modal trigger={<Button>Scan Wrong Box</Button>}
                      style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}>
                      <Modal.Header>Wrong Box</Modal.Header>
                      <Modal.Content>
                        <p>You scanned a wrong box! Please make sure you locate the right box and try again.</p>
                      </Modal.Content>
                    </Modal>
                    
                    <Modal trigger={<Button>Scan Wrong Product</Button>}
                      style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}>
                      <Modal.Header>Wrong Product</Modal.Header>
                      <Modal.Content>
                        <p>You scanned a wrong product! Please make sure you have the right product and try again.</p>
                      </Modal.Content>
                    </Modal>
                  </div>

                  <div>
                    <NumPad highlightAmount={ currentReplenishProduct.totalReplenishQuantity - replenishedAmount }
                      callback={this.selectReplenishedAmount}
                      disabled={ barcode === '' || boxBarcode === '' }></NumPad>
                  </div>
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