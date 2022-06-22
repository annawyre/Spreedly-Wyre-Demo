import React, { useState } from "react";
import axios from "axios";

const auth = `Bearer ${process.env.REACT_APP_SECRET_KEY}`;
const spreedlyAuth = `Basic ${process.env.REACT_APP_SPREEDLY_KEY}`;

class Quote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: "",
      currency: "BTC",
      srn: "bitcoin:",
      address: "",
      formComplete: false,
      exchangeRate: "",
      transactionFee: "",
      networkFee: "",
      purchaseTotal: "",
      reservationId: "",
      sourceAmount: "",
      destAmount: "",
      walletOrder: "",
      paymentToken: "",
    };

    this.amountChange = this.amountChange.bind(this);
    this.currencyChange = this.currencyChange.bind(this);
    this.addressChange = this.addressChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.amount !== this.state.amount) {
      if (this.state.amount !== "" && this.state.address !== "") {
        this.setState({ formComplete: true }, () => {
          this.getQuote();
        });
      } else {
        this.setState({ formComplete: false });
      }
    } else if (prevState.address !== this.state.address) {
      if (this.state.amount !== "" && this.state.address !== "") {
        this.setState({ formComplete: true }, () => {
          this.getQuote();
        });
      } else {
        this.setState({ formComplete: false });
      }
    } else if (prevState.currency !== this.state.currency) {
      if (this.state.amount !== "" && this.state.address !== "") {
        this.setState({ formComplete: true }, () => {
          this.getQuote();
        });
      } else {
        this.setState({ formComplete: false });
      }
    } else if (prevState.reservationId !== this.state.reservationId) {
      this.props.loadQuote(this.state);
      this.createOrder();
    } else if (prevState.walletOrder !== this.state.walletOrder) {
      this.props.loadOrder(this.state.walletOrder);
      this.props.onRouteChange("processing");
    }
  }

  getQuote = async () => {
    const res = await axios.post(
      "https://api.testwyre.com/v3/orders/quote/partner",
      {
        walletType: "DEBIT_CARD",
        amount: this.state.amount,
        sourceCurrency: "USD",
        destCurrency: this.state.currency,
        dest: this.state.srn + this.state.address,
        accountId: "ACCOUNT_ID",
        country: "US",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }
    );

    let quotes = res.data;
    this.setState({
      exchangeRate: String(quotes.exchangeRate).substring(0, 10),
    });
    this.setState({ transactionFee: quotes.fees.USD });
    this.setState({ purchaseTotal: this.state.amount });
    this.setState({ sourceAmount: quotes.sourceAmount });
    this.setState({ destAmount: quotes.destAmount });
  };

  amountChange(event) {
    this.setState({ amount: event.target.value });
  }

  addressChange(event) {
    this.setState({ address: event.target.value });
  }

  currencyChange(event) {
    this.setState({ currency: event.target.value });
    if (event.target.value === "ETH") {
      this.setState({ srn: "ethereum:" });
    } else if (event.target.value === "BTC") {
      this.setState({ srn: "bitcoin:" });
    }
  }

  createReservation = async () => {
    const reservation = await axios.post(
      `https://api.testwyre.com/v3/orders/reserve`,
      {
        referrerAccountId: "ACCOUNT_ID",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      }
    );
    let res_data = reservation.data;
    this.setState({ reservationId: res_data.reservation });
  };

  handleSubmit(event) {
    let token = document.getElementById("paymentToken").value;
    this.setState({ paymentToken: token });
    this.createReservation();
    event.preventDefault();
  }

  createOrder = async () => {
    const body =
      '{\n            "amount": "' +
      this.state.amount +
      '",\n            "sourceCurrency": "USD",\n            "destCurrency": "' +
      this.state.currency +
      '",            \n"dest": "' +
      this.state.srn +
      this.state.address +
      '",\n            "givenName": "Joe",\n            "familyName": "Smith",\n            "phone": "561-302-7111",\n            "email": "test@sendwyre.com",\n            "address": {\n                "street1": "123 Test Ave",\n                "city": "Portland",\n                "state": "OR",\n                "postalCode": "97209",\n                "country": "US"\n            },\n            "debitCard": {\n                "number": "{{credit_card_number}}",\n                "year": "{{credit_card_year}}",\n                "month": "{{credit_card_month}}",\n                "cvv": "555"\n            },\n            "reservationId": "' +
      this.state.reservationId +
      '",\n            "referrerAccountId": "ACCOUNT_ID",\n            "referenceId": "ACCOUNT_ID",\n            "ipAddress": "1.1.1.1"\n        }';
    console.log(body);
    const cardorder = await axios.post(
      "/api/receivers/YOUR_RECEIVER_TOKEN/deliver.json",
      {
        delivery: {
          payment_method_token: this.state.paymentToken,
          url: "https://api.testwyre.com/v3/debitcard/process/partner",
          headers:
            "Content-Type: application/json\nAuthorization: " +
            auth +
            "\n'Access-Control-Allow-Origin': '*'",
          body: body,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: spreedlyAuth,
        },
      }
    );

    let wyreResponse = JSON.parse(cardorder.data.transaction.response.body);
    this.setState({ walletOrder: wyreResponse.id });
  };

  render() {
    const formComplete = this.state.formComplete;
    let feeTable;
    if (formComplete) {
      feeTable = (
        <div>
          <table>
            <tbody>
              <tr>
                <td>
                  {this.state.exchangeRate
                    ? ` exchange rate: ${this.state.exchangeRate} `
                    : ""}
                </td>
              </tr>
              <tr>
                <td>
                  {this.state.transactionFee
                    ? ` source amount: ${this.state.sourceAmount} `
                    : ""}
                </td>
              </tr>
              <tr>
                <td>
                  {this.state.transactionFee
                    ? ` fees: ${this.state.transactionFee} `
                    : ""}
                </td>
              </tr>
              <tr>
                <td>
                  {this.state.destAmount
                    ? ` destination amount: ${this.state.destAmount} ${this.state.currency}`
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="container">
        <h1>Spreedly Express Card Processing Demo</h1>

        <form id="quoteForm" onSubmit={this.handleSubmit}>
          <label>
            currency:
            <select
              id="currencySelect"
              value={this.state.currency}
              onChange={this.currencyChange}
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
          </label>
          <br />
          <label>
            destination address:
            <input
              id="destAddress"
              type="text"
              value={this.state.address}
              onChange={this.addressChange}
              required
            />
          </label>
          <br />
          <label>
            amount in usd:
            <input
              id="usd"
              type="number"
              value={this.state.amount}
              onChange={this.amountChange}
              required
            />
          </label>
          <br />
          <input id="paymentToken" type="hidden" value="token" />
          <input type="button" value="Enter Payment Info" id="ready-to-pay" />
          <br />
        </form>
        {feeTable}
      </div>
    );
  }
}

export default Quote;
