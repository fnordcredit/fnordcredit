import React from "react";

export default class Modal extends React.Component<{},void> {
  constructor(props: {}) {
    super(props);
  }

  componentDidMount = () => {
    if (document.activeElement != null) {
      document.activeElement.blur();
    }
  }

  render() {
    return (
      <div style={modalStyle}>
        {this.props.children}
      </div>
    );
  }
}

const modalStyle = {
  height: "100%",
  width: "100%",
  top: 0,
  background: "rgba(0,0,0,0.3)",
  zIndex: 1001,
  position: "fixed"
};
