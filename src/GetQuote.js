import React, { useState } from 'react';
import axios from 'axios';

const auth = `Bearer ${process.env.REACT_APP_SECRET_KEY}`;

class Quote extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            amount: '',
            currency:'BTC',
            srn:'bitcoin:',
            address:'',
            formComplete: false,
            exchangeRate:'',
            transactionFee:'',
            networkFee:'',
            purchaseTotal:'',
            reservationId:'',
            sourceAmount:'',
            destAmount:'',
            
        
        };

        this.amountChange = this.amountChange.bind(this);
        this.currencyChange = this.currencyChange.bind(this);
        this.addressChange = this.addressChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps,prevState){
        if (prevState.amount !== this.state.amount){
            if (this.state.amount !== '' && this.state.address !== ''){
                this.setState({formComplete : true}, () => {
                    this.getQuote()
                })
            } else {
                this.setState({formComplete : false})
            }
        } else if (prevState.address !== this.state.address){
            if (this.state.amount !== '' && this.state.address !== ''){
                this.setState({formComplete : true}, () => {
                    this.getQuote()
                })
            } else {
                this.setState({formComplete : false})
            }
        } else if (prevState.currency !== this.state.currency){
            if (this.state.amount !== '' && this.state.address !== ''){
                this.setState({formComplete : true}, () => {
                    this.getQuote()
                })
            } else {
                this.setState({formComplete : false})
            }
        } else if (prevState.reservationId !== this.state.reservationId){
            this.props.loadQuote(this.state)
            this.props.onRouteChange('payment');
        }

    };

    getQuote = async () => {
        const res = await axios.post('https://api.testwyre.com/v3/orders/quote/partner',{
            
            "walletType": "DEBIT_CARD",
            "amount": this.state.amount,
            "sourceCurrency": "USD",
            "destCurrency": this.state.currency,
            "dest": this.state.srn + this.state.address,
            "accountId": "AC_6JLB7GQTA2Z",
            "country": "US"
           
        },{headers:{
            'Content-Type': 'application/json',
            'Authorization': auth}
        
        });
    
        let quotes = (res.data);
        this.setState({exchangeRate : String(quotes.exchangeRate).substring(0,10)})
        this.setState({transactionFee : quotes.fees.USD})
        this.setState({purchaseTotal : this.state.amount})
        this.setState({sourceAmount : quotes.sourceAmount})
        this.setState({destAmount : quotes.destAmount})
    };

    amountChange(event) {
        this.setState({amount: event.target.value});
    };

    addressChange(event) {
        this.setState({address: event.target.value});
    };

    currencyChange(event) {
        this.setState({currency: event.target.value});
        if (event.target.value === "ETH"){
            this.setState({srn:'ethereum:'})
        } else if (event.target.value === "BTC"){
            this.setState({srn:'bitcoin:'})
        }
    };

    createReservation = async () =>{
        const reservation = await axios.post(`https://api.testwyre.com/v3/orders/reserve`, {
            "referrerAccountId": "AC_6JLB7GQTA2Z"
        }, {headers:{
            'Content-Type': 'application/json',
            'Authorization': auth}
        
        })
        let res_data = (reservation.data);
        this.setState({reservationId: res_data.reservation})

    };

    handleSubmit(event){
        this.createReservation();
        event.preventDefault();
    };



    render() {

        const formComplete = this.state.formComplete;
        let feeTable;
        if(formComplete){
            feeTable =
                <div>
                <table>
                    <tbody>
                        <tr>
                            <td>{ this.state.exchangeRate ? ` exchange rate: ${this.state.exchangeRate} `: "" }</td>
                        </tr>
                        <tr>
                            <td>{ this.state.transactionFee ? ` source amount: ${this.state.sourceAmount} `: "" }</td>
                        </tr>
                        <tr>
                            <td>{ this.state.transactionFee ? ` fees: ${this.state.transactionFee} `: "" }</td>
                        </tr>
                        <tr>
                            <td>{ this.state.destAmount ? ` destination amount: ${this.state.destAmount} ${this.state.currency}`: "" }</td>
                        </tr>
                    </tbody>
                </table>
                </div>
        };

        return (
            <div className="container">
                <h1>Card Processing Form</h1>
                <p> Card processing Demo</p>

                <form onSubmit={this.handleSubmit}>
                    <label>
                        currency:
                        <select value = { this.state.currency} onChange={this.currencyChange}>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </label>
                    <br />
                    <label>
                        destination address:
                        <input type= "text" value ={this.state.address} onChange={this.addressChange} required/>
                    </label>
                    <br />
                    <label>
                        amount in usd:
                        <input type= "number" value ={this.state.amount} onChange={this.amountChange} required/>
                    </label>
                    <br />
                    <input type="submit" value="purchase with card" />
                    <br/>

                </form>
                {feeTable}

            </div>
        );
    }
}

export default Quote