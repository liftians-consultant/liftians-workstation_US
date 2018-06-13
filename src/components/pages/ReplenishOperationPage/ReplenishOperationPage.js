import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button, Dimmer, Loader, Image, Input } from 'semantic-ui-react';
import api from '../../../api';
// import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';
import './ReplenishOperationPage.css';
import WarningModal from '../../common/WarningModal/WarningModal';
import ImageNotFound from '../../../assets/images/no_photo_available.jpg';


const productImgBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL;

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
    openＷarningModal: false,
    nextPod: {},
    warningMessage: {
      onCloseFunc: () => {},
      headerText: '',
      contentText: ''
    }
  }

  checkPodInterval = {};

  scanBoxInputRef = null;
  scanProductInputRef = null;

  wrongBoxWarningMessage = {
    onCloseFunc: this.closeWrongBoxModal,
    headerText: 'Wrong Box',
    contentText: 'You scanned a wrong box! Please make sure you locate the right box and try again.'
  };

  wrongProductWarningMessage = {
    onCloseFunc: this.closeWrongProductModal,
    headerText: 'Wrong Product',
    contentText: 'You scanned a wrong product! Please make sure you have the right product and try again.'
  };

  finishedOrder = {
    binNum: 3,
    orderNo: '235345'
  };

  constructor(props) {
    super(props)

    // Setup Ref for input fields
    this.scanBoxInputRef = React.createRef();
    this.scanProductInputRef = React.createRef();

    // Bind the this context to the handler function
    this.selectReplenishedAmount = this.selectReplenishedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleProductScanBtnClick = this.handleProductScanBtnClick.bind(this);
    this.finishReplenish = this.finishReplenish.bind(this);
    this.closeWrongBoxModal = this.closeWrongBoxModal.bind(this);
    this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    this.handleBoxScanKeyPress = this.handleBoxScanKeyPress.bind(this);
    this.handleProductScanKeyPress = this.handleProductScanKeyPress.bind(this);
    this.setFocusToInputManual = this.setFocusToInputManual.bind(this);
    this.closeWarningModal = this.closeWarningModal.bind(this);
  }

  componentWillMount() {
    this.getUpcomingPod();
  }

  componentWillUnmount() {
    clearInterval(this.checkPodInterval);
  }

  componentDidMount() {
    this.setFocusToBoxScanInput();
  }


  setFocusToInputManual() {
    if (this.state.boxBarcode) {
      this.setFocusToProductScanInput();
    } else {
      this.setFocusToBoxScanInput();
    }
  }

  setFocusToBoxScanInput() {
    this.scanBoxInputRef.current.focus();
    this.scanBoxInputRef.current.inputRef.value = '';
    this.scanProductInputRef.current.inputRef.value = '';
  }

  setFocusToProductScanInput() {
    this.scanProductInputRef.current.inputRef.value = '';
    this.scanProductInputRef.current.focus();
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
        this.setFocusToBoxScanInput();
      }
    }, 1500);
  }

  validateReplenishData(data) {
    if (data.taskId > 0 && data.boxBarcode > 0 && data.productBarcodeList !== '' && data.replenishQty > 0) {
      return true;
    } else {
      return false;
    }
  }

  finishReplenish(replenishAmount, isNextPod=false, retry=false) {
    this.setState({ loading: true });
    const product = this.state.currentReplenishProduct;
    let barcodeList = this.state.barcodeList.filter(o => o.scanned).map(o => o.barcode).join(','); // only take barcode that are scanned
    // if (this.state.businessMode === 'pharmacy' ) {
    //   barcodeList = this.state.barcodeList.slice(0, replenishAmount).join(',');
    // }
    const data = {
      taskId: this.state.taskId,
      boxBarcode: this.state.boxBarcode,
      sourceLinesId: product.source_lines_id,
      productId: product.productID,
      productBarcodeList: barcodeList,
      replenishQty: replenishAmount,
      locateActType: product.locate_act_type,
    };

    if (!this.validateReplenishData(data)) {
      const warningMessage = {
        onCloseFunc: this.closeWarningModal,
        headerText: 'Invalid Data',
        contentText: 'The replenish data is not correct. Please contact your admin and make sure you have the right data'
      };
      this.setState({ openＷarningModal: true, warningMessage })
      return;
    }

    console.log("[REPLENISH] Request data", data);
    console.log("[REPLENISH] BoxBarcode", data.boxBarcode);
    api.replenish.atStationSubmitReplenishProduct(data).then(res => {
      if (res.data) { // return 1 if success
        console.log('[REPLENISH] Success');

        if (isNextPod) {
          this.forcePodToLeaveStation();
          return;
        }

        if (this.state.replenishedAmount === parseInt(this.state.currentReplenishProduct.totalReplenishQuantity, 10)) {
          console.log('[REPLENISH] Order Finish, Retrieving next bill');
          this.retrieveNextOrder();
          this.setFocusToBoxScanInput();
        } else {
          // replenish not yet finished
          this.setFocusToProductScanInput();
          this.setState({ loading: false });
        }
      } else {
        // TODO: ERROR MESSAGE
        console.log('[REPLENISH] Failed');
        const replenishedAmount = this.state.replenishedAmount - replenishAmount;
        this.setState({ loading: false, replenishedAmount });
      }
    }).catch((err) => {
      console.log('[ERROR] atStationAfterReplenishProduct', err);
      if (!retry) {
        console.log('[REPLENISH] Retrying');
        this.finishReplenish(replenishAmount, isNextPod, true);
      }
    });
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
    this.getProductList();
    // this.getPodInfo();
  }

  forcePodToLeaveStation() {
    api.station.forcePodToLeaveStationByTaskId(this.props.stationId, this.state.taskId).then(res => {
      console.log(`[REPLENISH] Force Pod with TaskId ${this.state.taskId} to leave`);
      this.getUpcomingPod();
      this.setFocusToBoxScanInput();
    });
  }

  getPodInfo() {
    console.log('[REPLENISH] GetPodInfo: current replenishing product', this.state.currentReplenishProduct);

    this.getProductBarcodeList(); // SIMULATION: GET BARCODE

    api.station.atStationPodLayoutInfo(this.props.stationId).then(res => {
      // console.log(res.data);
      if (res.data.length) {
        const podInfo = {
          ...this.state.podInfo,
          shelfBoxes: _.chain(res.data).sortBy('shelfID').map((elmt) => { return parseInt(elmt.maxBox, 10) }).reverse().value()
        }
        this.setState({ podInfo, loading: false })
      }
    }).catch( err => {
      console.error('[ERROR] Getting pod info', err);
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
          boxBarcode: 0,
          barcode: ''
        }, this.getPodInfo);
      } else {
        // when nothing return, that means the pod is finished
        // and need to wait for the next pod come in to station
        console.log("[GET PRODUCT LIST] No order return from the server");
        this.getUpcomingPod();
      }
    }).catch((err) => {
      console.error('[ERROR] Getting products list', err);
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
        const barcodeList = res.data.map(item => {
          return {
            barcode: item.productBarCode,
            scanned: false
          }
        })
        console.log('[GET PRODUCT BARCODE LIST] Barcode List', barcodeList);
        this.setState({ barcodeList });
      }

      if (callback) {
        callback();
      }
    }).catch( err => {
      console.log("[ERROR] WHILE GETTING BARCODE LIST", err);
    });
  }

  /* Simulate when the user scan the product */
  handleProductScanBtnClick() {
    // TODO: SIMULATION ONLY! NO PRODUCTION
    if (this.state.businessMode === 'pharmacy') {
      // all product have unique barcode. scann all product then send out the finish request

      this.setState({ replenishedAmount: this.state.replenishedAmount + 1 }, () => {
        console.log(`[SCAN PRODUCT] Replenished amount: ${this.state.replenishedAmount}`);
        if (this.state.replenishedAmount === this.state.currentReplenishProduct.totalReplenishQuantity) {
          this.finishReplenish(this.state.replenishedAmount);
        }
      });
    } else if (this.state.businessMode === 'ecommerce' ) {
      // only one barcode will be return and all product use same barcode
      // scanned once, send request everything number pad is clicked.
      console.log('[SCAN PRODUCT] SIMULATION: product scanned');
      this.setState({ barcodeList: [{ barcode: this.state.currentReplenishProduct.productID, scanned: true }]});
    }
  }


  /* Production Scan box handler */
  handleBoxScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      console.log(`[SCAN BOX] Box scanned: ${e.target.value}`);

      // validate box barcode
      const productInfo = this.state.currentReplenishProduct;
      const correctBoxCode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
      if (e.target.value === String(correctBoxCode)) {
        console.log('[SCAN BOX] Box correct');
        this.setState({ boxBarcode: e.target.value }, () => {
          this.setFocusToProductScanInput();
        });
      } else {
        console.log('[SCAN BOX] Wrong box!');
        this.setState({ openＷarningModal: true, warningMessage: this.wrongBoxWarningMessage });
        setTimeout(() => {
          this.closeWrongBoxModal();
        }, 3000);
      }
    }
  }

  validatePharmacyBarcode(barcode) {
    return new Promise( (resolve, reject) => {
      const barcodeIndex = _.findIndex(this.state.barcodeList, function(o) { return o.barcode === barcode });
      // validate if barcode is in barcode list
      if (barcodeIndex === -1) { // TODO: this is not right, its an object now. User lodash
        resolve({ valid: false, message: 'This barcode is not in the replenish list.'});
      }

      // check for duplicate
      if (this.state.barcodeList[barcodeIndex].scanned === true) {
        resolve({ valid: false, message: 'Duplicate barcode!'});
      }
  
      // // check if barcode on shelf
      // api.pick.getInventoryByProductBarcode(barcode, this.state.podInfo.podId, this.state.podInfo.podSide).then( res => {
      //   // api.pick.getInventoryByProductBarcode('T168000', 33 , 0).then( res => {
      //   console.log('[VALIDATE BARCODE]', res);
      //   if (res.data.length > 0) { // barcode is on the shelf
      //     resolve({ valid: true });
      //   } else {
      //     resolve({ valid: false, message: 'Wrong Product (this barcode is not on the shelf)'});
      //   }
      // }).catch(err => {
      //   resolve({ valid: false, message: 'Something went wrong while validating the barcode.'});
      // });
      const barcodeList = this.state.barcodeList;
      barcodeList[barcodeIndex].scanned = true;
      console.log('[SCAN PRODUCT] Barcode List', barcodeList);
      this.setState({ barcodeList }, () => resolve({ valid: true }) );
    });
  }

  handleProductScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      console.log(`[SCAN PRODUCT] Product Scanned: ${e.target.value}`);

      if (this.state.businessMode === 'pharmacy') {
        this.validatePharmacyBarcode(e.target.value).then((result) => {
          if (result.valid) {
            // all product have unique barcode. scann all product then send out the finish request
            this.setState({ replenishedAmount: this.state.replenishedAmount + 1 }, () => {
              console.log(`[SCAN PRODUCT] Replenished amount: ${this.state.replenishedAmount}`);
              this.setFocusToProductScanInput();
              if (this.state.replenishedAmount === this.state.currentReplenishProduct.totalReplenishQuantity) {
                this.finishReplenish(this.state.replenishedAmount);
              }
            });
          } else {
            console.log('[SCANNED] Invalid Barcode');
            const warningMessage = {
              onCloseFunc: this.closeWrongProductModal,
              headerText: 'Warning',
              contentText: result.message
            }
            this.setState({ openＷarningModal: true, warningMessage });
          }
        });
      } else if (this.state.businessMode === 'ecommerce' ) {
        // only one barcode will be return and all product use same barcode
        // scanned once, send request everything number pad is clicked.
        if (this.scanValidation(e.target.value)) {
          console.log('[SCAN PRODUCT] Product correct');
          this.setState({ barcodeList: [{ barcode: e.target.value, scanned: true }]});
        } else {
          console.log('[SCAN PRODUCT] Wrong product!');
          this.setState({ openＷarningModal: true, warningMessage: this.wrongProductWarningMessage });
          setTimeout(() => {
            this.closeWrongProductModal();
          }, 3000);
        }
      }
    }
  }

  /* Simulate when user scan the box barcode */
  handleScanBoxBtnClick() {
    const productInfo = this.state.currentReplenishProduct;
    // generate box barcode
    const boxBarcode = 1000000000 + (1000 * productInfo.podID) + productInfo.podSide * 100 + productInfo.shelfID * 10 + productInfo.boxID;
    console.log(`[SCAN BOX] SIMULATION: ${boxBarcode}`);
    this.setState({ boxBarcode });
    this.setFocusToProductScanInput();
  }

  handleNextPodBtnClick() {
    if (this.state.businessMode === 'pharmacy') {
      this.finishReplenish(this.state.replenishedAmount, true);
    } else if (this.state.businessMode === 'ecommerce') {
      this.forcePodToLeaveStation();
    }
  }

  handleWrongProductBtnClick() {
    this.setState({ openＷarningModal: true });
  }

  closeWrongBoxModal() {
    this.setState({ openＷarningModal: false });
    this.setFocusToBoxScanInput();
  }

  closeWrongProductModal() {
    this.setState({ openＷarningModal: false });
    this.setFocusToProductScanInput();
  }

  closeWarningModal() {
    this.setState({ openＷarningModal: false });
  }

  render() {
    const { podInfo, currentReplenishProduct, replenishedAmount, barcodeList, boxBarcode, warningMessage } = this.state;
    const highlightBox = {
      row: currentReplenishProduct ? parseInt(currentReplenishProduct.shelfID, 10) : 0,
      column: currentReplenishProduct ? parseInt(currentReplenishProduct.boxID, 10) : 0
    };

    const imageUrl = productImgBaseUrl + currentReplenishProduct.productID + '.png';

    const isScanned = (barcodeList.filter(o => o.scanned).length > 0);

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
                <Button color="red" >Shortage</Button>
              </div>
            </Grid.Column>

            <Grid.Column width={11}>
              <div className="product-info-block">
                <div className="product-name-container">
                  <span className="product-name">{ currentReplenishProduct.productName }</span>
                </div>
                <div className="product-remain-container">
                  <span className="remain-amount">{ currentReplenishProduct.totalReplenishQuantity - this.state.replenishedAmount }</span>
                </div>
                <div className="product-image-container">
                  <Image className="product-image" src={ imageUrl } onError={(e) => { e.target.src = ImageNotFound }}></Image>
                </div>
              </div>
              <div className="action-group-container">
                <div className="scan-input-group">
                  <div className="scan-input-holder">
                    <Input type="text"
                      placeholder="Enter or Scan Box Barcode"
                      ref={this.scanBoxInputRef}
                      onKeyPress={this.handleBoxScanKeyPress} />
                  </div>
                  <div className="scan-input-holder">
                    <Input type="text"
                      placeholder="Enter or scan Product Barcode"
                      ref={this.scanProductInputRef}
                      onKeyPress={this.handleProductScanKeyPress} />
                  </div>
                </div>
                <div className="action-btn-group">
                  {/* <Button primary onClick={ () => this.setFocusToInputManual() }>Set Focus</Button> */}
                  <Button primary size="medium" onClick={ () => this.handleNextPodBtnClick() }>Next Pod</Button>
                </div>

                { process.env.REACT_APP_ENV === 'DEV' && (
                  <div>
                    <Button primary size="medium" onClick={ () => this.handleScanBoxBtnClick() }>Scan Box</Button>
                    <Button primary size="medium" onClick={ () => this.handleProductScanBtnClick() } disabled={ this.state.boxBarcode === 0 } >Scan Product</Button>
                  </div>
                )}
              
                { this.state.businessMode === 'ecommerce' && <NumPad highlightAmount={ currentReplenishProduct.totalReplenishQuantity - replenishedAmount }
                  callback={this.selectReplenishedAmount}
                  disabled={ !isScanned || !boxBarcode }></NumPad> }
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <WarningModal open={ this.state.openＷarningModal}
          onClose={warningMessage.onCloseFunc.bind(this)}
          headerText={warningMessage.headerText}
          contentText={warningMessage.contentText}
        />
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