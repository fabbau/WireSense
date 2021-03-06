/**
 * @file
 * The Entry Point
 *
 * The extra line between the end of the @file docblock
 * and the file-closure is important.
 */

import '../assets/stylesheets/base.scss';

import React, { Component } from 'react';
import {Tracker,ColorTracker,ObjectTracker} from 'tracking';
import {Row, Col} from 'pui-react-grids';
import {Grid, FlexCol} from 'pui-react-flex-grids';
import {Divider} from 'pui-react-dividers';

import React_Grid from './drag_grid';
import Motion_Grid from './motion_grid';
import Motion_Drag from './motion_drag';
import Pixeltracker from "./Pixeltracker";



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pixel_camera: false ,leap:false, open};
    this.toggle_pixel_camera = this.toggle_pixel_camera.bind(this);
  }
  toggle_pixel_camera() {
   this.setState({ pixel_camera: !this.state.pixel_camera });
  }
  render() {
    return (
      <div className="container bg-glow" id="content">
        <h1>Usability Konzepte & neue Interaktionswege</h1>
        <h5>Sascha-Darius Knießner</h5>
          <Divider />
        <button onClick={this.toggle_pixel_camera}>
          Pixel Cam
        </button>
        <div className="test_area">
          <h4>Drag and Drop Widgets</h4>
          <React_Grid />
          <Divider />
          {this.state.pixel_camera ? <Pixeltracker></Pixeltracker> : ''}
        </div>
      </div>
    )
  }
};
export default App;
