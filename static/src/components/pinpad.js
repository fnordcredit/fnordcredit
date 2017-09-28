import React from "react";
import Modal from "./modal";
import RaisedButton from "material-ui/RaisedButton";
import * as Colors from "../colors";

export default class PinPad extends React.Component<{},void> {
  constructor(props: {}) {
    super(props);
  }

  render = () => {
    return (
      <Modal>
        <div>
          {[[1,2,3],[4,5,6],[7,8,9]].map(
            ns => (<div key={`${ns[0]}-${ns[2]}`}>{ns.map(
              n => <RaisedButton label={n} key={n} backgroundColor={Colors.background} labelColor={Colors.textColor} />
            )}</div>))}
          <RaisedButton label="X" backgroundColor={Colors.red} labelColor={Colors.textColor} />
          <RaisedButton label="0" backgroundColor={Colors.background} labelColor={Colors.textColor} />
          <RaisedButton label="OK" backgroundColor={Colors.green} labelColor={Colors.textColor} />
        </div>
      </Modal>
    );
  }
};
