import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid, Menu, Dropdown } from 'semantic-ui-react';
import TopNavigation from '../navigation/TopNavigation';

const workstationMenuCss = {
  paddingTop: '100px'
}

const subTaskNameLists = [
  ['尚未處理', '等待執行', '正在執行', '已完成', '取消訂單'], 
  ['尚未處理', '已完成', '已取消']
];

const mainTaskNameOptions = [
  { key: 1, text: '配送出貨', value: 1 },
  { key: 2, text: '短缺退貨', value: 2 },
  { key: 3, text: '拆包出庫', value: 3 },
  { key: 4, text: '調整出庫', value: 4 },
]


class PickTaskPage extends Component {

  state = {
    // mainTaskNameList: ['配送出貨', '短缺退貨', '拆包出庫', '調整出庫'],
    // subTaskNameList: [ '尚未處理', '等待執行', '正在執行', '已完成', '取消訂單'],
    activeItem: '',
    currentMainTask: 1,
  }

  handleTaskChange = (e, { value}) => this.setState({ currentMainTask: value });

  render() {

    const { activeItem, currentMainTask } = this.state;
    
    console.log(currentMainTask);
    const subTastList = currentMainTask === 4 ? subTaskNameLists[1] : subTaskNameLists[0];
    const subTaskMenuItems = subTastList.map((name) => 
      <Menu.Item >{name}</Menu.Item>
    );

    return (
      <div>
        <TopNavigation></TopNavigation>
        <div className="ui container workstation-menu" style={ workstationMenuCss }>
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                <Menu vertical>
                  <Menu.Item name="taskType">
                  <Dropdown placeholder='More' 
                    value={ currentMainTask } 
                    fluid
                    selection
                    options={ mainTaskNameOptions }
                    onChange={ this.handleTaskChange }  
                  />
                  </Menu.Item>
                </Menu>
                <Menu vertical defaultActiveIndex="1">
                  { subTaskMenuItems }
                </Menu>
              </Grid.Column>
            </Grid.Row>

          </Grid>
        </div>
      </div>
    );
  }
}

PickTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
};

function mapStateToProps(state) {

}

export default connect(mapStateToProps, {})(PickTaskPage);