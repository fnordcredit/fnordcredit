// @flow
import React from "react";
import * as Colors from "../colors";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import { GridContainer, GridItem } from "react-css-grid-layout";

type Props = {
  user: User,
  backToList: () => void,
  addCredit: (user: User, delta: number) => void,
  products: Array<Product>
}

export default class UserView extends React.Component<Props,void> {
  constructor(props: Props) {
    super(props);
  }

  add = (delta: number) => {
    this.props.addCredit(this.props.user, delta);
  }

  render() {
    return (
      <GridContainer
        areasTemplate='"userinfo actions"'
        columnTemplate="400px 1fr"
      >
        <GridItem area="userinfo" style={{padding: 20}}>
          <span style={{color: Colors.textColor, fontSize: 72, fontWeight: "bold"}}>
            {this.props.user.name}
          </span>
          <br/>
          <span style={{color: Colors.textColor, fontSize: 48}}>
            {`${this.props.user.credit.toFixed(2)}€`}
          </span>
          <br/>
          <br/>
          <RaisedButton label="Back"
            backgroundColor={Colors.background}
            labelColor={Colors.textColor}
            labelStyle={{fontSize: 26}}
            style={{width: 160, height: 80}}
            onClick={() => this.props.backToList()}
            icon={
              <FontIcon className="material-icons" color={Colors.textColor} style={{fontSize: 30, marginTop: -4}}>
                chevron_left
              </FontIcon>}
            />
        </GridItem>
        <GridItem area="actions">
          <ChangeCreditButton amount={ 0.5} addCredit={this.add} />
          <ChangeCreditButton amount={ 1.0} addCredit={this.add} />
          <ChangeCreditButton amount={ 1.5} addCredit={this.add} />
          <ChangeCreditButton amount={ 2.0} addCredit={this.add} />
          <ChangeCreditButton amount={ 5.0} addCredit={this.add} />
          <ChangeCreditButton amount={10.0} addCredit={this.add} />
          <ChangeCreditButton amount={20.0} addCredit={this.add} />
          <ChangeCreditButton amount={50.0} addCredit={this.add} />
          <br/>
          {this.props.products.map(prod =>
            <ChangeCreditButton amount={-prod.price}
                product={prod} addCredit={this.add} key={prod.name} />)}
          <br/>
          <ChangeCreditButton amount={-0.5} addCredit={this.add} />
          <ChangeCreditButton amount={-1.0} addCredit={this.add} />
          <ChangeCreditButton amount={-1.5} addCredit={this.add} />
          <ChangeCreditButton amount={-2.0} addCredit={this.add} />
        </GridItem>
      </GridContainer>
    );
  }
}

type ChangeCreditProps = {
  amount: number,
  addCredit: (delta: number) => void,
  product?: Product
}

class ChangeCreditButton extends React.Component<ChangeCreditProps,void> {
  constructor(props: ChangeCreditProps) {
    super(props);
  }

  text = () => {
    return `${this.props.amount < 0 ? "" : "+"}${this.props.amount.toFixed(2)}€`;
  }

  productExtra = () => {
    if (this.props.product == null) return null;
    return (
    <div style={{
      display: "block",
      height: "100%",
      width: "100%",
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: 1
    }}>
      <img src={this.props.product.imagePath}
          style={{height:"100%",margin: "0 auto"}} />
      <span style={{
          fontSize:26,
          color:Colors.textColor,
          lineHeight:"22px",
          display:"block",
          marginTop:"-102px",
          zIndex:2
        }}>
        {this.props.product.name}
      </span>
    </div>
    );
  }

  render() {
    return (
      <RaisedButton
        label={this.text()}
        labelColor={Colors.textColor}
        labelStyle={{fontSize:26,zIndex:2}}
        labelPosition="before"
        style={changeCreditButtonStyle}
        backgroundColor={this.props.amount < 0 ? Colors.red : Colors.green}
        onClick={() => this.props.addCredit(this.props.amount)}
      > {this.productExtra()} </RaisedButton>
    );
  }
}

const changeCreditButtonStyle = {
  height: 120,
  width: 160,
  margin: 10
};
