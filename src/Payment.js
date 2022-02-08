import React, { useState } from 'react';
import axios from 'axios';

const auth = `Bearer ${process.env.REACT_APP_SECRET_KEY}`;

class Payment extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            amount: this.props.amount,
            reservationId: this.props.reservationId,
            destCurrency: this.props.currency,
            dest: this.props.srn + this.props.address,
            number:'',
            month:'',
            year:'',
            cvv:'',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            ipAddress:'',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
            walletOrder: ''
        
        };

        this.numberChange = this.numberChange.bind(this);
        this.monthChange = this.monthChange.bind(this);
        this.yearChange = this.yearChange.bind(this);
        this.cvvChange = this.cvvChange.bind(this);
        this.firstChange = this.firstChange.bind(this);
        this.lastChange = this.lastChange.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.phoneChange = this.phoneChange.bind(this);
        this.streetChange = this.streetChange.bind(this);
        this.cityChange = this.cityChange.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.postalChange = this.postalChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    numberChange(event) {
        this.setState({number: event.target.value});
    };

    monthChange(event) {
        this.setState({month: event.target.value});
    };

    yearChange(event) {
        this.setState({year: event.target.value});
    };

    cvvChange(event) {
        this.setState({cvv: event.target.value});
    };

    firstChange(event) {
        this.setState({firstName: event.target.value});
    };

    lastChange(event) {
        this.setState({lastName: event.target.value});
    };

    emailChange(event) {
        this.setState({email: event.target.value});
    };

    phoneChange(event) {
        this.setState({phone: event.target.value});
    };

    streetChange(event) {
        this.setState({street: event.target.value});
    };

    cityChange(event) {
        this.setState({city: event.target.value});
    };

    stateChange(event) {
        this.setState({state: event.target.value});
    };

    postalChange(event) {
        this.setState({postalCode: event.target.value});
    };

    componentDidUpdate(prevProps,prevState){
        if (prevState.walletOrder !== this.state.walletOrder){
            this.props.loadOrder(this.state.walletOrder)
            this.props.onRouteChange('processing');
        }
    };

    createOrder = async () => {
        const cardorder = await axios.post('https://api.testwyre.com/v3/debitcard/process/partner', {
            "debitCard": {
                "number": this.state.number,
                "year": this.state.year,
                "month": this.state.month,
                "cvv": this.state.cvv
           },
           "reservationId": this.state.reservationId,
           "amount": this.state.amount,
           "sourceCurrency": "USD",
           "destCurrency": this.state.destCurrency,
           "dest": this.state.dest,
           "referrerAccountId": "AC_6JLB7GQTA2Z",
           "givenName": this.state.firstName,
           "familyName": this.state.lastName,
           "email": this.state.email,
           "ipAddress": "1.1.1.1",
           "phone": this.state.phone,
           "address": {
                "street1": this.state.street,
                "city": this.state.city,
                "state": this.state.state,
                "postalCode": this.state.postalCode,
                "country": "US"
           }
        },{headers:{
            'Content-Type': 'application/json',
            'Authorization': auth}
        
        }
        );

        let walletOrder = (cardorder.data.id);
        this.setState({walletOrder: walletOrder})

    };

    handleSubmit(event){
        this.createOrder();
        event.preventDefault();
    };

    render() {

        return (
            <div className="container">
                <h1>Card Details</h1>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Card Number
                        <input type= "number" maxLength = "16" value ={this.state.number} onChange={this.numberChange} required/>
                    </label>
                    <br />
                    <label>
                        Month
                        <input type= "number" maxLength = "2" value ={this.state.month} onChange={this.monthChange} required/>
                    </label>
                    <br />
                    <label>
                        Year
                        <input type= "number" maxLength = "4" value ={this.state.year} onChange={this.yearChange} required/>
                    </label>
                    <br />
                    <label>
                        CVV
                        <input type= "number" maxLength = "3" value ={this.state.cvv} onChange={this.cvvChange} required/>
                    </label>
                    <br />
                    <p>Billing Details</p>
                    <br/>
                    <label>
                        firstName
                        <input type= "text" value ={this.state.firstName} onChange={this.firstChange} required/>
                    </label>
                    <br />
                    <label>
                        lastName
                        <input type= "text" value ={this.state.lastName} onChange={this.lastChange} required/>
                    </label>
                    <label>
                        email
                        <input type= "text" value ={this.state.email} onChange={this.emailChange} required/>
                    </label>
                    <br />
                    <label>
                        phone
                        <input type= "text" value ={this.state.phone} onChange={this.phoneChange} required/>
                    </label>
                    <br />
                    <p>Address Info</p>
                    <br/>
                    <label>
                        Street
                        <input type= "text" value ={this.state.street} onChange={this.streetChange} required/>
                    </label>
                    <br />
                    <label>
                        City
                        <input type= "text" value ={this.state.city} onChange={this.cityChange} required/>
                    </label>
                    <br />
                    <label>
                        State
                        <input type= "text" value ={this.state.state} onChange={this.stateChange} required/>
                    </label>
                    <br />
                    <label>
                        Postal
                        <input type= "text" value ={this.state.postalCode} onChange={this.postalChange} required/>
                    </label>
                    <br />
                    <label>
                        Country
                        <select value ={this.state.country}>
                            <option value="US">US</option>
                        </select>
                    </label>
                    <br />
                    <br />
                    <input type="submit" value="purchase with card" />
                    <br/>

                </form>

            </div>
        );
    
    }
}

export default Payment