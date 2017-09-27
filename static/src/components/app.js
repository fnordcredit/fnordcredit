// @flow
import React from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import TopBar from "./topbar";
import axios from "axios";
import UserList from "./userlist";
import UserView from "./userview";
import BarcodeScanner from "./barcodescanner";

type Props = { server: string };
type State = {
  sorted: Sorting,
  users: Array<User>,
  products: Array<Product>,
  view: "userList"|"userDetail",
  selectedUser: ?User,
  alertText: string
};

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sorted: "last",
      users: [],
      products: [],
      view: "userList",
      selectedUser: null,
      alertText: ""
    };

    this.getAllProducts();
    this.getAllUsers();
  }

  catchError = (error: any) => {
    console.log(error.request.response);
    this.setState({alertText: error.request.response});
    setTimeout(() => this.setState({alertText: ""}), 4000);
  }

  getAllProducts = () => {
    axios.get(`http://${this.props.server}/products/all`)
      .then((response) => {
        this.setState({products: response.data});
      }).catch(this.catchError);
  }

  getAllUsers = (callback?: (users: Array<User>) => void) => {
    axios.get(`http://${this.props.server}/users/all`)
     .then((response) => {
       this.setState({users: response.data});
       if (callback != null) {
        callback(response.data);
       }
     })
     .catch(this.catchError);
  }

  addUser = (user: string) => {
    axios.post(`http://${this.props.server}/user/add`,
      { username: user })
      .then((response) => {
        const users = response.data;
        this.setState({users: users});
        const u = users.find(u => u.name == user ? u : undefined);
        if (u != null) {
          this.setState({selectedUser: u, view: "userDetail"});
        }
      })
      .catch(this.catchError);
  }

  selectUser = (user: User) => {
    axios.get(`http://${this.props.server}/user/${user.id}`,
      { headers: { "x-user-pincode": null }})
      .then((response) => {
        this.setState({view: "userDetail", selectedUser: response.data});
      })
      .catch(error => {
        if (error.request.status == 401) {
          console.log("Pin not implemented yet");
        } else {
          this.catchError(error);
        }
      });
  }

  addCredit = (user: User, delta: number) => {
    axios.post(`http://${this.props.server}/user/credit`,
      { id: user.id
      , delta: delta
      , product: null
      , description: delta.toFixed(2)
      }).then((response) => {
        this.setState({selectedUser: response.data});
      }).catch(this.catchError);
  }

  renderCurrentView = () => {
    if (this.state.view == "userList") {
      return (<UserList users={this.state.users}
                sorted={this.state.sorted}
                addUser={this.addUser}
                selectUser={this.selectUser} />);
    }
    if (this.state.view == "userDetail" && this.state.selectedUser != null) {
      const nextView = (<UserView user={this.state.selectedUser}
                backToList={() => this.setState({view: "userList"})}
                addCredit={this.addCredit}
                products={this.state.products} />);
      this.getAllUsers();
      return nextView;
    }
    return null;
  }

  buyProduct = (ean: string) => {
    const product = this.state.products.find(x => x.ean == ean);
    if (product == null || this.state.selectedUser == null) return;
    this.addCredit(this.state.selectedUser, -product.price);
    console.log(`You bought ${product.name}`);
  }

  render = () => {
    return (
      <MuiThemeProvider>
        <div>
          <TopBar
            currentSorting={this.state.sorted}
            changeState={(s) => this.setState({sorted: s})} />
          { this.renderCurrentView() }
          { this.state.alertText != "" ? (
            <div style={alertStyle} id="alert">
              <span style={{height: "60%", marginTop: "40%"}}>{this.state.alertText}</span>
            </div>
          ) : null }
          <BarcodeScanner onSuccess={this.buyProduct} />
        </div>
      </MuiThemeProvider>
    );
  }
};

const alertStyle = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  fontSize: 100,
  background: "#FF3333",
  zIndex: 100,
  lineHeight: "100%",
  verticalAlign: "middle",
  textAlign: "center"
};
