import React, { Component } from 'react';
import { EmployeeTable } from './components/EmployeeTable';


export default class App extends Component {

  render () {
      return (
   
          <div>
              <div>Employee List Management System</div>
             
              <EmployeeTable/>


          </div>

        

    );
  }
}
