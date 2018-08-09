import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Grid, Button, Dimmer, Loader, Input } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import api from 'api';
import ETagService from 'services/ETagService';
import ProductInfoDisplay from 'components/common/ProductInfoDisplay/ProductInfoDisplay';
import NumPad from 'components/common/NumPad/NumPad';
import WarningModal from 'components/common/WarningModal/WarningModal';
import BinSetupModal from 'components/common/BinSetupModal/BinSetupModal';
import ChangeBinModal from 'components/Operation/ChangeBinModal/ChangeBinModal';
import BinGroup from 'components/Operation/BinGroup/BinGroup';
import OrderFinishModal from 'components/Operation/OrderFinishModal/OrderFinishModal';
import WrongProductModal from 'components/Operation/WrongProductModal/WrongProductModal';
import PodShelfInfo from 'components/Operation/PodShelfInfo/PodShelfInfo';
import ConfirmDialogModal from 'components/common/ConfirmDialogModal/ConfirmDialogModal';
import {
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder,
  hideChangeBinModal,
  changeHolderBin,
} from 'redux/actions/operationAction';

import './PickOperationPage.css';

class PickOperationPage extends Component {
  state = {
    podInfo: {
      podId: 0,
      podSide: 0,
      shelfBoxes: [],
    },
    currentPickProduct: {
      quantity: 0,
    },
    taskId: 0,
    orderList: [],
    pickedAmount: 0,
    loading: true,
    barcode: '',
    showBox: false,
    openOrderFinishModal: false,
    openWrongProductModal: false,
    openBinSetupModal: false,
    openShortageConfirmModal: false,
    warningMessage: '',
    isTagPressed: false,
    isKeyPadPressed: false,
  };

  checkPodInterval = {};

  checkETagResondInterval = false;

  businessMode = process.env.REACT_APP_BUSINESS_MODE;

  finishedOrder = {
    binNum: 0,
    orderNo: '235345',
  };

  constructor(props) {
    super(props);

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
    this.closeChangeBinModal = this.closeChangeBinModal.bind(this);
    this.handleChangeBinCallback = this.handleChangeBinCallback.bind(this);
    this.handlePharmacyOkBtnClick = this.handlePharmacyOkBtnClick.bind(this);
    this.handleShortageModalConfirmed = this.handleShortageModalConfirmed.bind(this);
    // this.handleWrongProductBtnClick = this.handleWrongProductBtnClick.bind(this);
  }

  componentWillMount() {
    this.getUpcomingPod();
    ETagService.turnEndLightOffById(0);

    if (this.props.deviceList.length === 0) {
      console.log('[GET STATION DEVICE LIST]');
      this.props.getStationDeviceList(this.props.stationId).then(() => {
        console.log('[GET STATION DEVICE] device list get on CWM');
      });
    }

    // Register bin when first init
    api.pick.getUnassignedHolderByStation(this.props.stationId).then((res) => {
      console.log('[UNASSINGED HOLDER]', res.data);
      if (res.data.length > 0) {
        this.props.addHoldersToSetupWaitlist(res.data);
      }
    });
  }

  componentWillUnmount() {
    ETagService.turnEndLightOffById(0);
    clearInterval(this.checkPodInterval);
    clearInterval(this.checkETagResondInterval);
  }

  componentDidMount() {
    this.setFocusToScanInput();
  }

  setFocusToScanInput() {
    if (!this.state.openOrderFinishModal && !this.state.openBinSetupModal) {
      this.scanInputRef.current.inputRef.value = '';
      this.scanInputRef.current.focus();
    }
  }

  linkBinToOrder(deviceId, binId) {
    api.station.linkBinToOrder(binId, deviceId, this.props.username).then((res) => {
      if (res.data) {
        console.log('[LINK BIN TO ORDER] Success');
        toast.success(`Bin ${binId} has successfully linked`);
      } else {
        toast.warn('Please try again');
      }
    }).catch(() => {
      toast.error('SERVER ERROR: Link bin to order failed');
    });
  }

  initPickLight() {
    this.setWaitForETagInterval();
    ETagService.turnPickLightOnById(parseInt(this.state.currentPickProduct.binPosition, 10), this.state.currentPickProduct.quantity - this.state.pickedAmount);
  }

  selectPickedAmount(num) {
    this.setState(prevState => ({ pickedAmount: prevState.pickedAmount + num, isKeyPadPressed: true }), () => {
      if (this.state.isTagPressed === false) {
        toast.warn('Please press the highlighted ETag to confirm picking');
      } else {
        this.checkIsPickFinished();
      }
    });

    this.setState(prevState => ({ pickedAmount: prevState.pickedAmount + num, isKeyPadPressed: true }), () => {
      if (this.state.isTagPressed === false) {
        toast.warn('Please press the highlighted ETag to confirm picking');
      } else {
        this.checkIsPickFinished();
      }
    });
  }

  checkIsPickFinished() {
    // if all item are being placed in bin
    if (this.state.pickedAmount === parseInt(this.state.currentPickProduct.quantity, 10)) {
      ETagService.turnPickLightOffById(parseInt(this.state.currentPickProduct.binPosition, 10));
      this.finishPick();
    } else {
      this.setState({ isTagPressed: false, isKeyPadPressed: false }, () => {
        this.initPickLight();
      });
    }
  }

  getUpcomingPod() {
    // check if all task is finished
    api.station.checkNumberOfStationTasks(this.props.stationId).then((res) => {
      if (res.data) {
        // continue to call until next task arrive
        let isRecieve = false;
        this.checkPodInterval = setInterval(() => {
          if (!isRecieve) {
            api.station.atStationTask(this.props.stationId).then((response) => {
              if (response.data > 0) {
                console.log('[GET UPCOMING POD] Pod arrive station');
                this.setState({ taskId: res.data }, () => { isRecieve = true; });
              }
            });
          } else {
            console.log('[GET UPCOMING POD] Stop interval');
            clearInterval(this.checkPodInterval);
            this.retrieveNextOrder();
          }
        }, 1000);
      } else {
        toast.success('All the task is finished!');
        this.props.history.push('/pick-task');
      }
    }).catch((err) => {
      toast.error(`[SERVER ERROR] CheckNumberOfStationTasks, ${err.message}`);
    });
  }

  validateAfterPickData(data) {
    return true; // need to work on
  }

  finishPick(isShortage = true) {
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
      shortQty: isShortage ? parseInt(product.quantity, 10) - this.state.pickedAmount : 0,
    };

    console.log('[PICK OPERATION] AtStationAfterPickProduct data:', data);

    if (this.validateAfterPickData(data)) {
      api.pick.atStationAfterPickProduct(data).then((res) => {
        if (res.data) { // return 1 if success
          console.log('[PICK OPERATION] AtStationAfterPickProduct Success');
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
      console.log('[PICK OPERATION] Validation error');
      toast.warn('Barcode did not psas validation. Please try again.');
    }
  }

  atHolderAfterPickProduct(data, retry = false) {
    api.pick.atHolderAfterPickProduct(data).then((res) => {
      if (res.data > 0) {
        // set here because avoid data changed after async call
        console.log('[PICK OPERATION] AtHolderAfterPickProduct Success:', res.data);
        this.finishedOrder = {
          orderNo: this.state.currentPickProduct.order_no,
          binNum: parseInt(this.state.currentPickProduct.binPosition, 10),
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
    api.station.genStationTask(this.props.stationId).then(() => {
      console.log('[GEN STATION TASK] Called');
    });
  }

  retrieveNextOrder() {
    this.setState({ loading: true });
    this.getProductList();
    // this.getPodInfo();
  }

  checkIsOrderFinished() {
    api.pick.checkIsOrderFinished(this.state.currentPickProduct.order_no).then((res) => {
      if (res.data) { // return 1 or 0
        console.log('[CHECK ORDER FINISHED] Order finished', res.data);
        // TOOD: unassign
        ETagService.turnEndLightOnById(this.finishedOrder.binNum);
        this.setState({ openOrderFinishModal: true }, () => {
          this.setFocusToScanInput();
        });

        // toast.success('Order finished');
      }
    });
  }

  getPodInfo() {
    api.station.getPodLayoutInfoByTaskID(this.state.taskId).then((res) => {
      if (res.data.length) {
        console.log(`[POD LAYOUT] Pod height: ${res.data.length}`);

        this.setState(prevState => ({
          podInfo: {
            ...prevState.podInfo,
            shelfBoxes: _.chain(res.data)
              .sortBy('shelfID')
              .map(elmt => parseInt(elmt.maxBox, 10))
              .reverse()
              .value(),
          },
          loading: false,
        }));
        // this.setState({ podInfo, loading: false });
      } else {
        console.log('[POD LAYOUT] NO GOOD. Empty array returned..');
        setTimeout(() => {
          this.getPodInfo();
        }, 1000);
      }
    }).catch((err) => {
      console.log('[ERROR] getting pod info', err);
    });
  }

  getProductList() {
    api.pick.getPickInfoByTaskId(this.state.taskId).then((res) => {
      if (res.data.length) {
        console.log('[GET PRODUCT LIST] Pick info retrevied', res.data[0].productID);
        toast.info(`Product Retrieved: ${res.data[0].productID}`);
        this.setState({
          currentPickProduct: res.data[0],
          orderList: res.data,
          podInfo: {
            podId: res.data[0].podID,
            podSide: res.data[0].podSide,
            shelfBoxes: [],
          },
          barcode: '',
          pickedAmount: 0,
          showBox: false,
          isTagPressed: false,
          isKeyPadPressed: false,
        }, () => {
          this.getPodInfo();
          this.setFocusToScanInput();
        });
      } else {
        // when nothing return, that means the pod is finished
        // and need to wait for the next pod come in to station
        console.log('[GET PRODUCT LIST] No order return from the server');
        this.getUpcomingPod();
      }
    }).catch((err) => {
      console.error('[ERROR] getting products list', err);
    });
  }

  scanValidation(barcode) {
    if (barcode === this.state.currentPickProduct.productID) {
      return true;
    }

    return false;
  }

  validatePharmacyBarcode(barcode) {
    return new Promise((resolve) => {
      // check for duplicate
      if (this.state.barcode.indexOf(barcode) !== -1) {
        resolve({ valid: false, message: 'Duplicate barcode!' });
      }

      // check if barcode on shelf
      api.pick.getInventoryByProductBarcode(barcode, this.state.podInfo.podId, this.state.podInfo.podSide).then((res) => {
        // api.pick.getInventoryByProductBarcode('T168000', 33 , 0).then( res => {
        console.log('[VALIDATE BARCODE]', res);
        if (res.data.length > 0) { // barcode is on the shelf
          resolve({ valid: true });
        } else {
          resolve({ valid: false, message: 'Wrong Product (this barcode is not on the shelf)' });
        }
      }).catch(() => {
        resolve({ valid: false, message: 'Something went wrong while validating the barcode.' });
      });
    });
  }

  closeWarningModal() {
    this.setFocusToScanInput();
    this.setState({ warningMessage: '' });
  }

  setWaitForETagInterval() {
    let isRecieve = false;
    // constantly check for respond from eTag
    this.checkETagResondInterval = setInterval(function() {
      if (!isRecieve) {
        ETagService.checkRespond(parseInt(this.state.currentPickProduct.binPosition, 10)).then((res) => {
          if (res) {
            console.log('[WAIT FOR ETAG RESPOND] Etag respond');
            this.setState({ isTagPressed: true }, () => {
              isRecieve = true;
            });
          }
        });
      } else {
        console.log('[WAIT FOR ETAG RESPOND] Stop interval');
        clearInterval(this.checkETagResondInterval);

        ETagService.turnPickLightOffById(parseInt(this.state.currentPickProduct.binPosition, 10));

        // auto trigger pick procedure when there's only one unit required
        if (this.state.currentPickProduct.quantity === 1) {
          this.selectPickedAmount(1);
          return;
        }

        if (this.state.isKeyPadPressed === true) {
          this.checkIsPickFinished();
        }
      }
    }.bind(this), 500);
  }

  /* Just for pharmacy pick use only */
  setPharmacyWaitForEtagInterval() {
    let isRecieve = false;
    // constantly check for respond from eTag
    this.checkETagResondInterval = setInterval(function() {
      if (!isRecieve) {
        ETagService.checkRespond(parseInt(this.state.currentPickProduct.binPosition, 10)).then((res) => {
          if (res) {
            console.log('[WAIT FOR ETAG RESPOND][Pharmacy] Etag respond');
            isRecieve = true;
          }
        });
      } else {
        console.log('[WAIT FOR ETAG RESPOND][Pharmacy] Stop interval');
        clearInterval(this.checkETagResondInterval);
        this.checkETagResondInterval = false;

        ETagService.turnPickLightOffById(parseInt(this.state.currentPickProduct.binPosition, 10));
        this.finishPick(false);
      }
    }.bind(this), 500);
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

              ETagService.turnPickLightOnById(this.state.currentPickProduct.binPosition, pickedAmount);
              console.log(this.checkETagResondInterval);
              if (!this.checkETagResondInterval) {
                this.setPharmacyWaitForEtagInterval();
              }

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
            this.setState({ showBox: true, barcode: scannedValue });
            this.initPickLight();
          } else {
            this.setState({ barcode: scannedValue }, () => {
              this.setState({ openWrongProductModal: true });
            });
          }
        }
      }, 500);
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
      api.pick.getProductSerialNum(data).then((res) => {
        const barCodeIndex = res.data[0].barcode ? 0 : 1; // sometimes there will have empty barcode data return...
        console.log(`[SCANNED][SIMULATE] Get barcode ${res.data[barCodeIndex].barcode}`);
        if (this.businessMode === 'pharmacy') {
          const barcode = this.state.pickedAmount === 0 ? res.data[barCodeIndex].barcode : `${this.state.barcode},${res.data[barCodeIndex].barcode}`;
          const pickedAmount = this.state.pickedAmount + 1;

          ETagService.turnPickLightOnById(this.state.currentPickProduct.binPosition, pickedAmount);
          console.log(this.checkETagResondInterval);
          if (!this.checkETagResondInterval) {
            this.setPharmacyWaitForEtagInterval();
          }

          if (pickedAmount === this.state.currentPickProduct.quantity) {
            this.setState({ showBox: true, barcode, pickedAmount });
          } else {
            this.setState({ barcode, pickedAmount });
          }
        } else if (this.businessMode === 'ecommerce') {
          this.setState(prevState => (
            { showBox: !prevState.showBox, barcode: res.data[barCodeIndex].barcode }
          ));
        }
      });
    } else {
      this.setState({ barcode: '' });
    }
  }

  handleShortageClick() {
    console.log('[PICK OPERATION] Shortage Clicked!');
    this.setState({ openShortageConfirmModal: true });
  }

  handleShortageModalConfirmed(result) {
    if (result) {
      this.finishPick();
      toast.success('Shortage Confirmed');
    }

    this.setState({ openShortageConfirmModal: false });
  }

  handleWrongProductBtnClick() {
    const data = {
      podId: this.state.currentPickProduct.podID,
      podSide: this.state.currentPickProduct.podSide,
      shelfId: 2,
      boxId: 1,
    };

    // THE FOLLWING CODE IS JUST TRYIGN TO MAKE THE SIMULATION WORK....
    api.pick.getProductSerialNum(data).then((res) => {
      this.setState({ barcode: res.data[1].barcode }, () => {
        if (!this.scanValidation(res.data[1].barcode)) {
          this.setState({ openWrongProductModal: true });
        }
      });
    });
  }

  handleOrderFinishInputEnter(binBarcode, binLocation) {
    const holder = this.props.deviceList.find(device => device.deviceIndex === binLocation);

    if (holder.bin && holder.bin.binBarcode === binBarcode) {
      toast.warn('DO NOT SCAN THE SAME BIN');
      return;
    }

    const holderId = holder.deviceId;
    this.props.unassignBinFromHolder(holderId).then((res) => {
      if (res) {
        this.props.addBinToHolder(binBarcode, holderId).then((response) => {
          if (response) {
            ETagService.turnEndLightOffById(this.finishedOrder.binNum);
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

  handleBinSetupInputEnter(binBarcode) {
    this.props.addBinToHolder(binBarcode, this.props.currentSetupHolder.deviceId);
  }

  closeBinSetupModal() {
    this.setState({ openBinSetupModal: false });
    this.setFocusToScanInput();
  }

  handleChangeBinCallback(holderId, binBarcode) {
    console.log(`[CHANGE BIN] holder: ${holderId}, binBarcode: ${binBarcode}`);
    this.props.changeHolderBin(binBarcode, holderId).then((res) => {
      if (res === 1) {
        toast.success('Successfully change bin');
        this.props.hideChangeBinModal();
      } else if (res === -1) {
        toast.warn('Cannot change bin. No order linked to this holder.');
      } else if (res === -2) {
        toast.warn('Cannot change bin. Bin is already linked to an order.');
      } else if (res === -3) {
        toast.warn('Cannot change bin. Bin is already linked to an holder');
      } else {
        toast.warn(`DB P_ChangeHolderBin error. Error code: ${res.data}`);
      }
    });
  }

  closeChangeBinModal() {
    this.props.hideChangeBinModal();
  }

  handlePharmacyOkBtnClick() {
    ETagService.turnPickLightOffById();
    this.finishPick();
  }

  render() {
    const { warningMessage, podInfo, currentPickProduct, pickedAmount, showBox,
      orderList, openOrderFinishModal, openWrongProductModal, barcode } = this.state;
    const highlightBox = {
      row: currentPickProduct ? parseInt(currentPickProduct.shelfID, 10) : 0,
      column: currentPickProduct ? parseInt(currentPickProduct.boxID, 10) : 0,
    };

    return (
      <div className="pick-operation-page">
        <Dimmer active={this.state.loading}>
          <Loader content="Waiting for pod..." indeterminate size="massive"/>
        </Dimmer>
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              <PodShelfInfo
                podInfo={podInfo}
                highlightBox={highlightBox}
                orderList={orderList}
                onShortageClicked={this.handleShortageClick}
                showAdditionBtns
              />
            </Grid.Column>

            <Grid.Column width={11}>
              { !showBox ? (
                <div>
                  <ProductInfoDisplay
                    product={currentPickProduct}
                    quantity={currentPickProduct.quantity}
                    pickedAmount={pickedAmount}
                  />
                  <div className="action-group-container">
                    <div className="scan-input-group">
                      { this.businessMode === 'pharmacy' && (
                        <h4>
                          [
                          {' '}
                          {this.state.barcode}
                          {' '}
                          ]
                        </h4>
                      )}
                      <br />
                      <div className="scan-input-holder">
                        <Input
                          type="text"
                          placeholder="Enter or Scan Box Barcode"
                          ref={this.scanInputRef}
                          onKeyPress={this.handleScanKeyPress}
                        />
                      </div>
                    </div>
                    <div className="action-btn-group" />
                  </div>
                  { process.env.REACT_APP_ENV === 'DEV' && (
                    <Button primary size="medium" onClick={() => this.handleScanBtnClick()}>
                      Scan
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <BinGroup openedBinNum={parseInt(currentPickProduct.binPosition, 10)} />
                  { this.businessMode === 'pharmacy' ? (
                    <Button className="ok-btn" size="massive" primary onClick={() => this.handlePharmacyOkBtnClick()}>
                      OK
                    </Button>
                  ) : (
                    currentPickProduct.quantity > 1 && (
                    <NumPad
                      highlightAmount={currentPickProduct.quantity - pickedAmount}
                      callback={this.selectPickedAmount}
                    />)
                  )}
                </div>
              ) }
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <OrderFinishModal
          data={this.finishedOrder}
          modalOpen={openOrderFinishModal}
          onInputEnter={this.handleOrderFinishInputEnter}
        />

        { openWrongProductModal && (
          <WrongProductModal
            podInfo={podInfo}
            productId={barcode}
            open={openWrongProductModal}
            close={this.closeWrongProductModal}
          />)
        }

        <BinSetupModal
          open={this.props.currentSetupHolder.deviceIndex > 0}
          location={this.props.currentSetupHolder.deviceIndex}
          onInputEnter={this.handleBinSetupInputEnter}
        />

        { warningMessage && (
          <WarningModal
            open
            onClose={this.closeWarningModal}
            headerText="Warning"
            contentText={warningMessage}
          />)
        }

        <ChangeBinModal
          open={this.props.openChangeBinModal}
          onClose={this.closeChangeBinModal}
          deviceList={this.props.deviceList}
          onChangeBinCallback={this.handleChangeBinCallback}
        />

        <ConfirmDialogModal
          size="mini"
          open={this.state.openShortageConfirmModal}
          close={this.handleShortageModalConfirmed}
          header="Shortage"
          content="Are you sure you want to report a shortage?"
        />
      </div>
    );
  }
}

PickOperationPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stationId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskCount: state.station.info.taskCount,
    deviceList: state.operation.deviceList,
    binSetupWaitlist: state.operation.binSetupWaitlist,
    currentSetupHolder: state.operation.currentSetupHolder,
    openChangeBinModal: state.operation.openChangeBinModal,
  };
}
export default connect(mapStateToProps, {
  getStationDeviceList,
  addHoldersToSetupWaitlist,
  addBinToHolder,
  unassignBinFromHolder,
  hideChangeBinModal,
  changeHolderBin,
})(PickOperationPage);
