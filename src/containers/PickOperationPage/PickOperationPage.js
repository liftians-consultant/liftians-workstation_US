import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Grid, Button, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from "react-toastify";

import api from 'api';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import NumPad from 'components/common/NumPad/NumPad';
import WarningModal from "components/common/WarningModal/WarningModal";
import BinSetupModal from 'components/common/BinSetupModal/BinSetupModal';

import BinGroup from 'components/Operation/BinGroup/BinGroup';
import OrderFinishModal from 'components/Operation/OrderFinishModal/OrderFinishModal';
import WrongProductModal from 'components/Operation/WrongProductModal/WrongProductModal';
import PodShelfInfo from '../../components/Operation/PodShelfInfo/PodShelfInfo';
import { 
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder
} from 'redux/actions/operationAction';

import './PickOperationPage.css';

class PickOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: []
    },
    currentPickProduct: {
      quantity: 0
    },
    taskId: 0,
    orderList: [],
    pickedAmount: 0,
    loading: true,
    barcode: '',
    showBox: false,

    binSetupWaitlist: [],
    currentSetupHolder: {
      deviceIndex: 0,
    },
    openOrderFinishModal: false,
    openWrongProductModal: false,
    openBinSetupModal: false,
    warningMessage: ''
  };

  checkPodInterval = {};

  businessMode = process.env.REACT_APP_BUSINESS_MODE;

  finishedOrder = {
    binNum: 0,
    orderNo: '235345'
  };

  constructor(props) {
    super(props)

    this.scanInputRef = React.createRef();
    this.orderFinishInputRef = React.createRef();

    // Bind the this context to the handler function
    this.selectPickedAmount = this.selectPickedAmount.bind(this);
    this.retrieveNextOrder = this.retrieveNextOrder.bind(this);
    this.handleOrderFinishInputEnter = this.handleOrderFinishInputEnter.bind(this);
    this.closeWrongProductModal = this.closeWrongProductModal.bind(this);
    this.handleScanBtnClick = this.handleScanBtnClick.bind(this);
    this.finishPick = this.finishPick.bind(this);
    this.handleScanKeyPress = this.handleScanKeyPress.bind(this);
    this.setFocusToScanInput = this.setFocusToScanInput.bind(this);
    this.handleShortageClick = this.handleShortageClick.bind(this);
    this.closeWarningModal = this.closeWarningModal.bind(this);
    this.closeBinSetupModal = this.closeBinSetupModal.bind(this);
    this.handleBinSetupInputEnter = this.handleBinSetupInputEnter.bind(this);
    // this.handleWrongProductBtnClick = this.handleWrongProductBtnClick.bind(this);
  }

  componentWillMount() {
    this.getUpcomingPod();

    // Register bin when first init

    api.pick.getUnassignedHolderByStation(this.props.stationId).then(res => {
      console.log('[UNASSINGED HOLDER]', res.data);
      if (res.data.length > 0) {
        this.props.addHoldersToSetupWaitlist(res.data);
      }
    })

    if (!this.props.deviceList) {
      console.log('[GET STATION DEVICE LIST]');
      this.props.getStationDeviceList(this.props.stationId).then(res => {
        console.log('[GET STATION DEVICE] device list get on CWM');
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkPodInterval);
  }

  componentDidMount() {
    this.setFocusToScanInput();
  }

  setFocusToScanInput() {
    if (!this.state.openOrderFinishModal) {
      this.scanInputRef.current.inputRef.value = '';
      this.scanInputRef.current.focus();
    }
  }

  initialBinSetup() {
    // refresh device list first 
    this.props.getStationDeviceList(this.props.stationId).then(deviceList => {
      const binSetupWaitlist = this.state.binSetupWaitlist.concat(deviceList);
      const currentSetupHolder = binSetupWaitlist.shift();
      this.setState({ binSetupWaitlist, currentSetupHolder, openBinSetupModal: true });
    });
    
  }
  
  linkBinToOrder(deviceId, binId) {
    api.station.linkBinToOrder(binId, deviceId, this.props.username).then(res => {
      if (res.data) {
        console.log('[LINK BIN TO ORDER] Success');
        toast.success(`Bin ${binId} has successfully linked`);
      } else {
        toast.warn('Please try again') ;
      }
    }).catch(err => {
      // TODO: Error toast
      toast.error('SERVER ERROR: Link bin to order failed')
    });
  }

  selectPickedAmount(num) {
    this.setState({ pickedAmount: this.state.pickedAmount + num }, () => {

      // if all item are being placed in bin
      if (this.state.pickedAmount === parseInt(this.state.currentPickProduct.quantity, 10)) {
        this.turnPickLightOffById(parseInt(this.state.currentPickProduct.binPosition, 10));
        this.finishPick();
      } else {
        this.turnPickLightOnById(parseInt(this.state.currentPickProduct.binPosition, 10), this.state.currentPickProduct.quantity - this.state.pickedAmount);
      }
    });
  }

  getUpcomingPod() {
    let isRecieve = false;

    this.checkPodInterval = setInterval( () => {
      if (!isRecieve) {
        api.station.atStationTask(this.props.stationId).then( res => {
          if (res.data > 0) {
            console.log('[GET UPCOMING POD] Pod arrive station');
            this.setState({ orderProductList: res.data, taskId: res.data }, () => isRecieve = true);
          }
        });
      } else {
        console.log('[GET UPCOMING POD] Stop interval');
        clearInterval(this.checkPodInterval);
        this.retrieveNextOrder();
      }
    }, 500);
  }

  validateAfterPickData(data) {
    return true; // need to work on
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

    console.log(`[PICK OPERATION] AtStationAfterPickProduct data:`, data);

    if (this.validateAfterPickData(data)) {
      api.pick.atStationAfterPickProduct(data).then(res => {
        if (res.data) { // return 1 if success
          console.log(`[PICK OPERATION] AtStationAfterPickProduct Success`);
          // this.setState({ showBox: false }, () => this.retrieveNextOrder());
          data.holderId = this.state.currentPickProduct.holderID;

          // call liftman to generate new task
          this.callGenStationTask();

          // after placed in bin, inform db
          this.atHolderAfterPickProduct(data);
        } else {
          // TODO: ERROR MESSAGE
          toast.error('ERROR: atStationAfterPickProduct did not succuss in server');
        }
      }).catch((err) => {
        console.error('[ERROR] for atStationAfterPickProduct', err);
        toast.error('ERROR: atStationAfterPickProduct');
      });
    } else {
      console.log('[PICK OPERATION] Validation error')
      toast.warn('Barcode did not psas validation. Please try again.');
    }
  }

  atHolderAfterPickProduct(data, retry = false) {
    api.pick.atHolderAfterPickProduct(data).then( res => {
      if ( res.data > 0 ) {
        // set here because avoid data changed after async call
        console.log(`[PICK OPERATION] AtHolderAfterPickProduct Success:`, res.data);
        this.finishedOrder = {
          orderNo: this.state.currentPickProduct.order_no,
          binNum: parseInt(this.state.currentPickProduct.binPosition, 10)
        };
        this.checkIsOrderFinished();
        this.retrieveNextOrder();
      } else {
        console.log(`[ERROR] AtHolderAfterPickProduct FAILED: ${res.data}`);
        if (!retry) { // first time retry
          console.log('[ERROR - RETRY] Retry AtHolderAfterPickProduct...');
          toast.error('ERROR: AtHolderAfterPickProduct: Will retry in 2 sec');
          setTimeout(() => { // set timeout just to let database buffer
            this.atHolderAfterPickProduct(data, true);  
          }, 2000);
        } else {
          // retry also failed
          console.log(`[ERROR - RETRY] AtHolderAfterPickProduct Failed after retry: ${res.data}`);
          toast.error('ERROR: AtHolderAfterPickProduct. Retry failed as well');
        }
      }
    });
  }

  callGenStationTask() {
    api.station.genStationTask(this.props.stationId).then( res => {
      console.log('[GEN STATION TASK] Called');
    });
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
    this.getProductList();
    // this.getPodInfo();
  }

  checkIsOrderFinished() {
    api.pick.checkIsOrderFinished(this.state.currentPickProduct.order_no).then( res => {
      if (res.data) { // return 1 or 0
        console.log("[CHECK ORDER FINISHED] Order finished", res.data);
        // TOOD: unassign
        this.turnEndLightOnById(this.finishedOrder.binNum);
        this.setState({ openOrderFinishModal: true }, () => {
          this.setFocusToScanInput();
        });
        
        // toast.success('Order finished');
      }
    });
  }

  getPodInfo() {
    api.station.atStationPodLayoutInfo(this.props.stationId).then(res => {
      if (res.data.length) {
        console.log(`[POD LAYOUT] Pod height: ${res.data.length}`)
        const podInfo = {
          ...this.state.podInfo,
          shelfBoxes: _.chain(res.data).sortBy('shelfID').map((elmt) => { return parseInt(elmt.maxBox, 10) }).reverse().value()
        }
        this.setState({ podInfo, loading: false });
      } else {
        console.log('[POD LAYOUT] NO GOOD. Empty array returned..')
        setTimeout(() => {
          this.getPodInfo();  
        }, 1000);
      }
    }).catch( err => {
      console.log('[ERROR] getting pod info', err);
    });
  }

  getProductList() {
    api.pick.getPickInfoByTaskId(this.state.taskId).then(res => {
      if (res.data.length) {
        console.log("[GET PRODUCT LIST] Pick info retrevied", res.data[0].productID);
        this.setState({
          currentPickProduct: res.data[0],
          orderList: res.data,
          podInfo: {
            podId: res.data[0].podID,
            podSide: res.data[0].podSide,
            shelfBoxes: []
          },
          barcode: '',
          pickedAmount: 0,
          showBox: false }, () => {
            this.getPodInfo();
            this.setFocusToScanInput();
          });
      } else {
        // when nothing return, that means the pod is finished
        // and need to wait for the next pod come in to station
        console.log("[GET PRODUCT LIST] No order return from the server");
        this.getUpcomingPod();
      }
    }).catch((err) => {
      console.error('[ERROR] getting products list', err);
    });
  }

  scanValidation(barcode) {
    if (barcode === this.state.currentPickProduct.productID) {
      return true;
    } else {
      return false;
    }
  }

  validatePharmacyBarcode(barcode) {
    return new Promise( (resolve, reject) => {
      // check for duplicate
      if (this.state.barcode.indexOf(barcode) !== -1) {
        resolve({ valid: false, message: 'Duplicate barcode!'});
      }
  
      // check if barcode on shelf
      api.pick.getInventoryByProductBarcode(barcode, this.state.podInfo.podId, this.state.podInfo.podSide).then( res => {
        // api.pick.getInventoryByProductBarcode('T168000', 33 , 0).then( res => {
        console.log('[VALIDATE BARCODE]', res);
        if (res.data.length > 0) { // barcode is on the shelf
          resolve({ valid: true });
        } else {
          resolve({ valid: false, message: 'Wrong Product (this barcode is not on the shelf)'});
        }
      }).catch(err => {
        resolve({ valid: false, message: 'Something went wrong while validating the barcode.'});
      });
    });
  }

  closeWarningModal() {
    this.setFocusToScanInput();
    this.setState({ warningMessage: '' });
  }

  turnPickLightOnById(labelId, num) {
    api.eTag.turnPickLightOnById(labelId, num).then( res => {
      if (res.data) {
        console.log(`[E-TAG] Turn on pick light #${labelId} with ${num}`);
      } else {
        console.log(`[E-TAG] Pick light turn on failed #${labelId} with ${num}`);
      }
    })
  }

  turnPickLightOffById(labelId) {
    api.eTag.turnPickLightOffById(labelId).then(res => {
      if (res.data) {
        console.log(`[E-TAG] Turn off pick light #${labelId}`);
      } else {
        console.log(`[E-TAG] Pick light turn off failed #${labelId}`);
      }
    })
  }

  turnEndLightOnById(labelId) {
    api.eTag.turnEndLightOnById(labelId).then( res => {
      if (res.data) {
        console.log(`[E-TAG] Turn on End light #${labelId}`);
      } else {
        console.log(`[E-TAG] End light turn on failed #${labelId}`);
      }
    })
  }

  turnEndLightOffById(labelId) {
    api.eTag.turnEndLightOffById(labelId).then(res => {
      if (res.data) {
        console.log(`[ELECTRONIC LABEL] Turn off End light #${labelId}`);
      } else {
        console.log(`[ELECTRONIC LABEL] End light turn off failed #${labelId}`);
      }
    })
  }

  handleScanKeyPress(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        console.log('[SCANNED]', e.target.value);
        const scannedValue = e.target.value;
        if (this.businessMode === 'pharmacy') {
          // validate barcode
          this.validatePharmacyBarcode(scannedValue).then((result) => {
            if (result.valid) {
              const barcode = this.state.pickedAmount === 0 ? scannedValue : `${this.state.barcode},${scannedValue}`;
              const pickedAmount = this.state.pickedAmount + 1;
              if (pickedAmount === this.state.currentPickProduct.quantity) {
                this.setState({ showBox: true, barcode, pickedAmount });
              } else {
                this.setFocusToScanInput();
                this.setState({ barcode, pickedAmount });
              }
              console.log(`[SCANNED] New Barcode: ${barcode}`);
            } else {
              console.log('[SCANNED] Invalid Barcode');
              this.setState({ warningMessage: result.message });
            }
          });
          
        } else if (this.businessMode === 'ecommerce') {
          if (this.scanValidation(scannedValue)) {
            console.log(`[SCANNED] New Barcode: ${scannedValue}`);
            this.setState({ showBox: !this.state.showBox, barcode: scannedValue });
            this.turnPickLightOnById(parseInt(this.state.currentPickProduct.binPosition, 10), this.state.currentPickProduct.quantity);
          } else {
            this.setState({ barcode: scannedValue } , () => {
              this.setState({ openWrongProductModal: true })
            });
          }
        }
      }, 1500);
    }
  }

  /* WARNING: SIMULATION ONLY */
  handleScanBtnClick() {
    if (!this.state.showBox) {
      const data = {
        podId: this.state.currentPickProduct.podID,
        podSide: this.state.currentPickProduct.podSide,
        shelfId: this.state.currentPickProduct.shelfID,
        boxId: this.state.currentPickProduct.boxID,
      };
      api.pick.getProductSerialNum(data).then( res => {
        const barCodeIndex = res.data[0].barcode ? 0 : 1; // sometimes there will have empty barcode data return...
        console.log(`[SCANNED][SIMULATE] Get barcode ${res.data[barCodeIndex].barcode}`);
        if (this.businessMode === 'pharmacy') {
          const barcode = this.state.pickedAmount === 0 ? res.data[barCodeIndex].barcode : `${this.state.barcode},${res.data[barCodeIndex].barcode}`;
          const pickedAmount = this.state.pickedAmount + 1;
          if (pickedAmount === this.state.currentPickProduct.quantity) {
            this.setState({showBox: true, barcode, pickedAmount});
          } else {
            this.setState({ barcode, pickedAmount });
          }
        } else if (this.businessMode === 'ecommerce') {
          this.setState({ showBox: !this.state.showBox, barcode: res.data[barCodeIndex].barcode });
        }
      });
    } else {
      this.setState({ barcode: ''});
    }
  }

  handleShortageClick() {
    console.log('[PICK OPERATION] Shortage Clicked!');
    this.finishPick();
  }

  handleWrongProductBtnClick() {
    const data = {
      podId: this.state.currentPickProduct.podID,
      podSide: this.state.currentPickProduct.podSide,
      shelfId: 2,
      boxId: 1,
    };

    // THE FOLLWING CODE IS JUST TRYIGN TO MAKE THE SIMULATION WORK....
    api.pick.getProductSerialNum(data).then( res => {
      this.setState({ barcode: res.data[1].barcode }, () => {
        if (!this.scanValidation(res.data[1].barcode)) {
          this.setState({ openWrongProductModal: true });
        }
      });
    });
  }

  handleOrderFinishInputEnter(binBarcode, binLocation) {
    const holderId = this.props.deviceList.find(device => device.deviceIndex === binLocation).deviceId;
    this.props.unassignBinFromHolder(holderId, this.finishedOrder.orderNo).then(res => {
      if (res) {
        this.props.addBinToHolder(binBarcode, holderId).then(res => {
          if (res) {
            this.turnEndLightOffById(this.finishedOrder.binNum);
            this.setState({ showBox: false, openOrderFinishModal: false }, () => {
              this.setFocusToScanInput();
            });
          }
        });
      }
    });
  }

  closeWrongProductModal() {
    this.setState({ openWrongProductModal: false });
    this.setFocusToScanInput();
  }

  handleBinSetupInputEnter(binBarcode, binLocation) {
    this.props.addBinToHolder(binBarcode, this.props.currentSetupHolder.deviceId);
  }

  closeBinSetupModal() {
    this.setState({ openBinSetupModal: false });
    this.setFocusToScanInput();
  }

  render() {
    const { warningMessage, podInfo, currentPickProduct, pickedAmount, showBox,
      orderList, openOrderFinishModal, openWrongProductModal, barcode, openBinSetupModal } = this.state;
    const highlightBox = {
      row: currentPickProduct ? parseInt(currentPickProduct.shelfID, 10) : 0,
      column: currentPickProduct ? parseInt(currentPickProduct.boxID, 10) : 0
    };

    return (
      <div className="pick-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content='Waiting for pod...' indeterminate size="massive"/>
        </Dimmer>
        <Grid>
          <Grid.Row >
            <Grid.Column width={5}>
              <PodShelfInfo podInfo={ podInfo }
                highlightBox={ highlightBox }
                orderList={ orderList }
                onShortageClicked={ this.handleShortageClick }
                showAdditionBtns={true}
              />
            </Grid.Column>

            <Grid.Column width={11}>
              { !showBox ? (
                <div>
                  <ProductInfoDisplay product={ currentPickProduct } quantity={ currentPickProduct.quantity } pickedAmount={ pickedAmount }></ProductInfoDisplay>
                  <div className="action-group-container">
                    <div className="scan-input-group">
                      { this.businessMode === 'pharmacy' && (
                        <h4>[ { this.state.barcode} ]</h4>
                      )}
                      <br />
                      <div className="scan-input-holder">
                        <Input type="text"
                          placeholder="Enter or Scan Box Barcode"
                          ref={this.scanInputRef}
                          onKeyPress={this.handleScanKeyPress}/>
                      </div>
                    </div>
                    <div className="action-btn-group">
                  
                    </div>
                  </div>
                  { process.env.REACT_APP_ENV === 'DEV' && (
                        <Button primary size="medium" onClick={ () => this.handleScanBtnClick() }>Scan</Button>
                      )}
                </div>
              ) : (
                <div>
                  <BinGroup openedBinNum={ parseInt(currentPickProduct.binPosition, 10) }></BinGroup>
                  { this.businessMode === 'pharmacy' ? (
                    <Button className="ok-btn" size="massive" primary onClick={() => this.finishPick(currentPickProduct.quantity)}>OK</Button>
                  ) : (
                    <NumPad highlightAmount={ currentPickProduct.quantity - pickedAmount }
                      callback={this.selectPickedAmount}
                    ></NumPad>
                  )}
                </div>
              ) }
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <OrderFinishModal data={ this.finishedOrder }
          modalOpen={ openOrderFinishModal }
          onInputEnter={ this.handleOrderFinishInputEnter }
          ></OrderFinishModal>

        { openWrongProductModal && <WrongProductModal podInfo={ podInfo }
          productId={ barcode }
          open={ openWrongProductModal }
          close={ this.closeWrongProductModal } /> }

        <BinSetupModal
          open={ this.props.currentSetupHolder.deviceIndex > 0 }
          location={ this.props.currentSetupHolder.deviceIndex }
          onInputEnter={ this.handleBinSetupInputEnter }
        />

        { warningMessage && <WarningModal open={true}
          onClose={ this.closeWarningModal }
          headerText="Warning"
          contentText={ warningMessage } /> }
      </div>
    );
  }
}

PickOperationPage.propTypes = {
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskCount: state.station.info.taskCount,
    deviceList: state.operation.deviceList,
    binSetupWaitlist: state.operation.binSetupWaitlist,
    currentSetupHolder: state.operation.currentSetupHolder
  }
}
export default connect(mapStateToProps, {
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder
})(PickOperationPage);