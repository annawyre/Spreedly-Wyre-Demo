import React, { useState } from 'react';
import axios from 'axios';


const auth = `Bearer ${process.env.REACT_APP_SECRET_KEY}`;

class Processing extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            walletOrder: this.props.walletOrder,
            woStatus: '',
            authRequest: false,
            smsAuth: false,
            cardAuth: false,
            smsCode: '',
            cardCode: '',
            reservationId: this.props.reservationId,
            authorization3dsUrl: ''
        }

        this.smsChange = this.smsChange.bind(this);
        this.cardChange = this.cardChange.bind(this);
    }

    

    getStatus = async () => {
        const orderStatus = await axios.get(
            `https://api.testwyre.com/v3/orders/${this.state.walletOrder}/full`, 
            {headers:{'Authorization': auth}}
            )

            let res = (orderStatus.data);
            this.setState({woStatus : res.status})
            if (this.state.woStatus === "RUNNING_CHECKS") {
                this.getAuth()
            }
            this.setState({authRequest: res.authCodesRequested})
    }


    getAuth = async () => {
        const authStatus = await axios.get(
            `https://api.testwyre.com/v3/debitcard/authorization/${this.state.walletOrder}`, 
            {headers:{'Authorization': auth}}
            )
            let res = (authStatus.data);
            this.setState({smsAuth : res.smsNeeded})
            this.setState({cardAuth : res.card2faNeeded})
            this.setState({authorization3dsUrl : res.authorization3dsUrl})

    }

    confirmSms = async () =>{
        const sms = await axios.post(`https://api.testwyre.com/v3/debitcard/authorize/partner`, {
            "type": "SMS",
            "walletOrderId": this.state.walletOrder,
            "reservation": this.state.reservationId,
            "sms": this.state.smsCode
            }, 
            {headers:{
            'Content-Type': 'application/json',
            'Authorization': auth}
        
            })
        let res_data = (sms.data);
        this.setState({smsAuth : false})
    }

    confirmCard = async () =>{
        const bank = await axios.post(`https://api.testwyre.com/v3/debitcard/authorize/partner`, {
            "type": "CARD2FA",
            "walletOrderId": this.state.walletOrder,
            "reservation": this.state.reservationId,
            "card2fa": this.state.cardCode
            }, 
            {headers:{
            'Content-Type': 'application/json',
            'Authorization': auth}
        
            })
        let res_data = (bank.data);
        this.setState({cardAuth : false})
    }

    componentDidMount(){
        this.checkAuth()
    }

    componentDidUpdate(prevProps,prevState){
        if (prevState.woStatus !== this.state.woStatus){
            this.checkAuth()
        }
        if (prevState.authRequest !== this.state.authRequest){
            this.getAuth()
        }
        if (prevState.authorization3dsUrl !== this.state.authorization3dsUrl){
            if (this.state.authorization3dsUrl !== null) {
                window.open(this.state.authorization3dsUrl)
            }
        }
    }

    sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    checkAuth = async () => {
            this.getStatus()
            while(this.state.woStatus === "RUNNING_CHECKS" || this.state.woStatus === "PROCESSING" ){
                this.getStatus()
                await this.sleep(1000)

        }
    }

    smsChange(event) {
        this.setState({smsCode: event.target.value});
    }

    cardChange(event) {
        this.setState({cardCode: event.target.value});
    }


    render(){

        const smsAuth = this.state.smsAuth;
        const cardAuth = this.state.cardAuth;
        let authForm;
        if(smsAuth){
            authForm =
                <div>
                <input type = "text" value = {this.state.smsCode} onChange = {this.smsChange}/> 
                <button onClick={this.confirmSms}>Sms Submit</button>
                </div>
                
        } else if (cardAuth){
            authForm =
            <div>
            <input type = "text" value = {this.state.cardCode} onChange = {this.cardChange}/> 
            <button onClick={this.confirmCard}>Bank Code Submit</button>
            </div>

        }

        return(
            <div>
            <p>{this.state.woStatus}</p>
            {authForm}
            </div>
        )

    }




}


export default Processing