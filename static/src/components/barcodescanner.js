// @flow
import React from "react";

type Props = {
  onSuccess: (barcode: string) => void
};

type State = {
  scannedString: string,
  mode: "off"|"entering"|"on"
}

export default class BarcodeScanner extends React.Component<Props,State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      scannedString: "",
      mode: "off"
    };
  }

  componentDidMount = () => {
    window.addEventListener("keydown", this.onKeyDown);
  }

  componentWillUnmount = () => {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key == "Alt") {
      this.setState({mode: "entering"});
    } else if (this.state.mode == "entering" && e.key == "k") {
      this.setState({mode: "on"});
      // if the bar code scanner sends enter and the focus is on a button,
      // the button is activated instead.
      if (document.activeElement != null) {
        document.activeElement.blur();
      }
    } else if (this.state.mode == "on" && e.key == "Enter") {
      this.props.onSuccess(this.state.scannedString);
      this.setState({mode: "off", scannedString: ""});
    } else if (this.state.mode == "on") {
      this.setState({scannedString: this.state.scannedString + e.key});
    }
    if (this.state.scannedString.length > 100) {
      this.setState({scannedString: ""});
    }
  }

  render = () => {
    return null;
  }
}
