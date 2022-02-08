import { render } from "@testing-library/react";
import React, {useState} from "react";
import axios from 'axios';
import Quote from './GetQuote';
import Payment from './Payment';
import Processing from './Processing';

const initialState = {
    route:'quote',
    amount: '',
    currency:'BTC',
    srn:'bitcoin:',
    address:'',
    reservationId:'',
    walletOrder:''
}

class App extends React.Component {
    constructor(){
        super();
        this.state = initialState
    }


    onRouteChange = (route) => {
        this.setState({route:route})
        
    }

    loadQuote = (data) => {
        this.setState(
            {
                amount : data.amount,
                currency : data.currency,
                srn : data.srn,
                address : data.address,
                reservationId : data.reservationId
            }, () => {
                console.log(this.state)
            }
            )
    }

    loadOrder = (data) => {
        this.setState(
            {walletOrder:data}
        )
    }

    render(){

        if (this.state.route === 'quote'){
            return(
                <Quote onRouteChange={this.onRouteChange} loadQuote={this.loadQuote}/>
            )
        } else if (this.state.route === 'payment'){
            return(
                <Payment onRouteChange={this.onRouteChange} {...this.state} loadOrder={this.loadOrder}/>
            )
        }
        else if (this.state.route === 'processing'){
            return(
                <Processing onRouteChange={this.onRouteChange} walletOrder={this.state.walletOrder} loadOrder={this.loadOrder}/>
            )
        }


    }

}

export default App;


