// @flow
import React from "react";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import FontIcon from "material-ui/FontIcon";
import TextField from "material-ui/TextField";
import * as Colors from "../colors";

type Props = {
  currentSorting: Sorting,
  changeState: (sorted: Sorting) => void,
  changeSearchText: (text: string) => void
};

export default class TopBar extends React.Component<Props,void> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <Toolbar style={toolbarStyle}>
        <ToolbarGroup firstChild={true} lastChild={true}>
          <SortButton sorting="last" {...this.props} />
          <SortButton sorting="abc" {...this.props} />
          <SortButton sorting="zyx" {...this.props} />
        </ToolbarGroup>
        <ToolbarGroup>
          <TextField floatingLabelText="Search..."
            onChange={(e,s) => this.props.changeSearchText(s)} />
        </ToolbarGroup>
      </Toolbar>
    );
  }
};

type SortButtonProps = {
  sorting: Sorting,
  currentSorting: Sorting,
  changeState: (sorted: Sorting) => void
};

class SortButton extends React.Component<SortButtonProps,void> {
  constructor(props: SortButtonProps) {
    super(props);
  }

  render() {
    return (
      <IconButton
        style={iconButtonStyle}
        iconStyle={iconStyle(this.props.sorting == this.props.currentSorting)}
        onClick={() => {this.props.changeState(this.props.sorting)}}>
        <FontIcon className="material-icons" hoverColor={Colors.active}>
          {icons[this.props.sorting]}
        </FontIcon>
      </IconButton>
    );
  }
}

const icons = {
  abc: "vertical_align_bottom",
  zyx: "vertical_align_top",
  last: "restore"
};
const toolbarStyle = {
  background: Colors.background,
  color: Colors.textColor,
  height: 64
};
const iconStyle = (active) => ({
  fontSize: 52,
  color: active ? Colors.active : Colors.textColor
});
const iconButtonStyle = {
  width: 64,
  height: 64,
  padding: 6
};
