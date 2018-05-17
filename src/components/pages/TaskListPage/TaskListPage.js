import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Icon, Label, Menu, Table } from 'semantic-ui-react'
import moment from "moment";
import api from '../../../api';
import './TaskListPage.css';

class TaskListPage extends Component {

  state = {
    taskList: []
  }

  componentWillMount() {
    api.system.getTaskList().then(res => {
      if (res.data) {
        console.log('[TASK LIST] Get task list', res.data);
        this.setState({ taskList: res.data });
      }
    });
  }
  
  render() {
    const { taskList } = this.state;

    const tableRows = taskList.map((task, index) => {
      return (
        <Table.Row key={task.taskID}>
          <Table.Cell>
            <Label>{task.taskID}</Label>
          </Table.Cell>
          <Table.Cell>{ task.taskStatusID }</Table.Cell>
          <Table.Cell>{ task.taskTypeID }</Table.Cell>
          <Table.Cell>{ moment(task.taskCreateTime).format(process.env.REACT_APP_TABLE_DATE_FORMAT_NO_SEC) }</Table.Cell>
          <Table.Cell>{ task.botid }</Table.Cell>
          <Table.Cell>{ task.botStatusID }</Table.Cell>
          <Table.Cell>{ task.podid }</Table.Cell>
          <Table.Cell>{ task.podStatusID }</Table.Cell>
          <Table.Cell>{ task.podrotation }</Table.Cell>
          <Table.Cell>{ task.origin_X / 1000 }</Table.Cell>
          <Table.Cell>{ task.origin_Y / 1000 }</Table.Cell>
          <Table.Cell>{ task.destination_X / 1000 }</Table.Cell>
          <Table.Cell>{ task.destination_Y / 1000 }</Table.Cell>
          <Table.Cell>{ task.priority }</Table.Cell>
          <Table.Cell>{ task.stationID }</Table.Cell>
          <Table.Cell>{ task.pairTaskID }</Table.Cell>
        </Table.Row>
      )
    })

    return (
      <div className="task-list-page-container">
        <div className="page-header">
          <span>Task List</span>
        </div>
        <div className="task-list-table-container page-content-container">
          <Table className="task-list-table" celled inverted structured selectable striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell rowSpan='2'>Task ID</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>StatusID</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>TypeID</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Create Time</Table.HeaderCell>
                <Table.HeaderCell colSpan='2'>Bot</Table.HeaderCell>
                <Table.HeaderCell colSpan='3'>Pod</Table.HeaderCell>
                <Table.HeaderCell colSpan='2'>Original</Table.HeaderCell>
                <Table.HeaderCell colSpan='2'>Destinated</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Priority</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>Station</Table.HeaderCell>
                <Table.HeaderCell rowSpan='2'>PairTask</Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Rotation</Table.HeaderCell>
                <Table.HeaderCell>X</Table.HeaderCell>
                <Table.HeaderCell>Y</Table.HeaderCell>
                <Table.HeaderCell>X</Table.HeaderCell>
                <Table.HeaderCell>Y</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { tableRows }
            </Table.Body>

            {/* <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='3'>
                  <Menu floated='right' pagination>
                    <Menu.Item as='a' icon>
                      <Icon name='chevron left' />
                    </Menu.Item>
                    <Menu.Item as='a'>1</Menu.Item>
                    <Menu.Item as='a'>2</Menu.Item>
                    <Menu.Item as='a'>3</Menu.Item>
                    <Menu.Item as='a'>4</Menu.Item>
                    <Menu.Item as='a' icon>
                      <Icon name='chevron right' />
                    </Menu.Item>
                  </Menu>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer> */}
          </Table>
        </div>
      </div>
    );
  }
}

// TaskListPage.propTypes = {

// };

export default TaskListPage;
