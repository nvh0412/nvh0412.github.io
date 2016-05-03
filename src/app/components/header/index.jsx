import React from 'react';
import NavBar from './navBar';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="header">
        <NavBar />
      </div>
    )
  }
}
