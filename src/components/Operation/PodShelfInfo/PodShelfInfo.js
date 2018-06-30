import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import PodShelf from 'components/common/PodShelf/PodShelf';
import OrderDetailListModal from 'components/Operation/OrderDetailListModal/OrderDetailListModal';

const PodShelfInfo = props => {
  return (
    <div className="pod-shelf-info-display-container">
      <div className="pod-info-block">
        <span>Pod #{ props.podInfo.podId } - { props.podInfo.podSide === 0 ? 'A' : 'B' }</span>
      </div>
      <Segment.Group>
        <Segment>
          <PodShelf podInfo={ props.podInfo } highlightBox={ props.highlightBox }></PodShelf>
        </Segment>
      </Segment.Group>
      { props.showAdditionBtns && (
        <div>
          { props.orderList.length > 0 && <OrderDetailListModal orderList={ props.orderList } /> }
          <Button color="red" onClick={ props.onShortageClicked }>Shortage</Button>  
        </div>
      )}
      
    </div>
  );
};

PodShelfInfo.propTypes = {
  podInfo: PropTypes.object.isRequired,
  highlightBox: PropTypes.object.isRequired,
  orderList: PropTypes.array,
  onShortageClicked: PropTypes.func,
  showAdditionBtns: PropTypes.bool.isRequired
};

PodShelfInfo.defaultProps = {
  showAdditionBtns: false
}

export default PodShelfInfo;