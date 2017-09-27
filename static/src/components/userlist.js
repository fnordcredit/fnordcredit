// @flow
import * as React from "react";
import Paper from "material-ui/Paper";
import Dialog from "material-ui/Dialog";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import * as Colors from "../colors";

import RaisedButton from "material-ui/RaisedButton";

type Props = {
  users: Array<User>,
  sorted: Sorting,
  addUser: (u: string) => void,
  selectUser: (u: User) => void
};

export default class UserList extends React.Component<Props,void> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const sortUsers = (a: User, b: User) => {
      if (this.props.sorted == "last") {
        return Math.sign(b.lastchanged - a.lastchanged);
      }
      if (this.props.sorted == "abc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    };

    return (
      <div>
        <AddUser addUser={this.props.addUser} />
        {this.props.users.sort(sortUsers)
          .map(u => <SelectUser user={u} key={u.name} onClick={this.props.selectUser} />)}
      </div>
    );
  }
}

type UserButtonProps = { onClick?: () => void, children: React.Node };

class UserButton extends React.Component<UserButtonProps,void> {
  constructor(props: UserButtonProps) {
    super(props);
  }
  render() {
    return (
      <RaisedButton style={userButtonStyle} {...this.props} backgroundColor={Colors.background}>
        <span style={{display: "inline-block", verticalAlign: "middle", lineHeight: "30px", color: Colors.textColor}}>
          {this.props.children}
        </span>
      </RaisedButton>
    );
  }
}

const userButtonStyle = {
  height: 120,
  width: 160,
  display: "inline-block",
  margin: 16,
  fontSize: 26,
  cursor: "pointer"
};

type SelectUserProps = { user: User, onClick: (u: User) => void };

class SelectUser extends React.Component<SelectUserProps,void> {
  constructor(props: SelectUserProps) {
    super(props);
  }
  render() {
    return (
      <UserButton onClick={() => this.props.onClick(this.props.user)}>
        {this.props.user.name}
        <br/>
        {this.props.user.credit.toFixed(2)}€
      </UserButton>
    );
  }
};

type AddUserState = { open: boolean, userName: string };
type AddUserProps = { addUser: (user: string) => void };

class AddUser extends React.Component<AddUserProps,AddUserState> {
  constructor(props: AddUserProps) {
    super(props);
    this.state = {
      open: false,
      userName: ""
    };
  }
  render() {
    const addUser = () => {
      this.props.addUser(this.state.userName);
      this.setState({open: false, userName: ""});
    };
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={() => this.setState({open: false, userName: ""})}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        onClick={addUser}
      />,
    ];
    return (
        <UserButton onClick={() => this.setState({open: true})}>
          <span style={{fontSize: 56}}>+</span>
          <Dialog
            title="Add User"
            actions={actions}
            modal={true}
            open={this.state.open}
          >
            <TextField floatingLabelText="User Name" onChange={(x,name) => this.setState({userName:name})} />
          </Dialog>
        </UserButton>
    );
  }
}
