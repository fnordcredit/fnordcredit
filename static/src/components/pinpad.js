import React from "react";
import Modal from "./modal";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import * as Colors from "../colors";

type State = {
  pin: string
};

export default class PinPad extends React.Component<{},State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      pin: ""
    };
  }

  appendPin = (c: string) => {
    this.setState({pin: this.state.pin + c});
  }

  render = () => {
    return (
      <Modal>
        <div>
          <TextField
            floatingLabelText="Pin"
            type="password"
            disabled={true}
            value={this.state.pin}
          />
          {[[1,2,3],[4,5,6],[7,8,9]].map(
            ns => (<div key={`${ns[0]}-${ns[2]}`}>{ns.map(
              n => <FlatButton label={n} key={n} backgroundColor={Colors.background} onClick={() => this.appendPin(n)} {...buttonStyle} />
            )}</div>))}
          <FlatButton label="X" backgroundColor={Colors.red} {...buttonStyle} />
          <FlatButton label="0" backgroundColor={Colors.background} onClick={() => this.appendPin(0)} {...buttonStyle} />
          <FlatButton label="OK" backgroundColor={Colors.green} {...buttonStyle} />
        </div>
      </Modal>
    );
  }
};

const buttonStyle = {
  style: {
    width: 120,
    height: 90
  },
  labelStyle: {
    fontSize: 26,
    color: Colors.textColor
  },
  hoverColor: Colors.lightBackground
};
