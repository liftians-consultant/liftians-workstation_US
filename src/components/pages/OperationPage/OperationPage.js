import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import _ from "lodash";
import { Segment, Grid, Button, Portal, Header } from 'semantic-ui-react';
import api from '../../../api';
import ProductInfoDisplay from '../../common/ProductInfoDisplay/ProductInfoDisplay';
// import RemainPickAmount from "./components/RemainPickAmount/RemainPickAmount";
import './OperationPage.css';
import PodShelf from '../../common/PodShelf/PodShelf';
import NumPad from '../../common/NumPad/NumPad';
import BinGroup from './components/BinGroup/BinGroup';
import OrderDetailListModal from './components/OrderDetailListModal/OrderDetailListModal';

const testData = [
  {
    stationId: 1,
    shelfID: "3",
    productName: "Coke cola (6 pack)",
    boxID: "1",
    source_ID: "123424",
    source_lines_id: "32949",
    productID: "PA023421",
    lot_No: "2393",
    taskType: "P",
    quantity: "2"
  }, {
    stationId: 1,
    shelfID: "3",
    productName: "Diet Coke (12 pack)",
    boxID: "2",
    source_ID: "1234234",
    source_lines_id: "332949",
    productID: "PA0234223",
    lot_No: "2333",
    taskType: "P",
    quantity: "4"
  },
]
class OperationPage extends Component {

  state = {
    podInfo: {
      podId: '',
      shelfBoxes: []
    },
    currentPickProduct: {},
    orderList: [],
    pickedAmount: 0,
    loading: false,
    barcode: '',
    showBox: false
  }

  constructor(props) {
    super(props)

    // Bind the this context to the handler function
    this.selectPickedAmount = this.selectPickedAmount.bind(this);
  }

  componentWillMount() {
    this.retrieveNextOrder();
  }

  selectPickedAmount(num) {
    this.setState({ pickedAmount: this.state.pickedAmount + num }, () => {
      if (this.state.pickedAmount === parseInt(this.state.currentPickProduct.quantity, 10)) {
        this.finishOrder();
      }
    });
  }

  finishOrder() {
    const product = this.state.currentPickProduct;
    const data = {
      stationId: this.props.stationId,
      shelfId: product.shelfID,
      boxId: product.boxID,
      orderNo: product.order_No,
      sourceLinesId: product.source_Lines_Id,
      productId: product.productID,
      lotNo: product.lot_No,
      packageBarcode: this.state.barcode,
      pickQuantity: this.state.pickedAmount,
      taskSubtype: product.locate_ACT_TYPE,
      shortQty: parseInt(product.quantity, 10) - this.state.pickedAmount,
    }

    api.pick.atStationAfterPickProduct(data).then(res => {
      console.log(res.data);
      if (res.data) { // return 1 if success
        // this.setState({ showBox: false }, () => this.retrieveNextOrder());
        // after placed in bin, inform db
        api.pick.atHolderAfterPickProduct(data).then( res => {
          this.retrieveNextOrder();
        })
      } else {
        // TODO: ERROR MESSAGE
      }
    }).catch((err) => {
      console.error('Error for atStationAfterPickPorduct', err);
    });
  }

  retrieveNextOrder() {
    this.getPodInfo();
    this.getProductList();
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
        // res.data = testData;
        this.setState({ 
          currentPickProduct: res.data[0],
          orderList: res.data,
          pickedAmount: 0,
          showBox: false });
      } else { // when there's nothing return from the sever to pick
        console.log("No order return from the server");
      }
    }).catch((err) => {
      console.error('Error getting products list', err);
    });
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
        this.state.barcode = res.data[0].barcode;
        this.setState({ showBox: !this.state.showBox });
      })
    } else {
      this.state.barcode = '';
    }
    
  }

  render() {
    const { podInfo, currentPickProduct, pickedAmount, showBox, orderList } = this.state;
    const highlightBox = {
      row: currentPickProduct ? parseInt(currentPickProduct.shelfID, 10) : 0,
      column: currentPickProduct ? parseInt(currentPickProduct.boxID, 10) : 0
    };

    return (
      <div className="operationPage">
        <Grid>
          <Grid.Row >
            <Grid.Column width={5}>
              <Segment.Group>
                <Segment>
                  <PodShelf podInfo={ podInfo } highlightBox={ highlightBox }></PodShelf>
                </Segment>
              </Segment.Group>
              { orderList.length > 0 && <OrderDetailListModal orderList={orderList} /> }
            </Grid.Column>

            <Grid.Column width={11}>
              { !showBox ? (
                <div>
                  <ProductInfoDisplay product={ currentPickProduct } pickedAmount={ pickedAmount }></ProductInfoDisplay>
                  <br></br>
                  <Button primary size="huge" onClick={ () => this.handleScanBtnClick() }>
                    { !showBox ? 'Scan' : 'Placed in box' }
                  </Button>
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