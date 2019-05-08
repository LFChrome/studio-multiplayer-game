import GameComponent from '../../GameComponent.js';
import React from 'react';
import UserApi from '../../UserApi.js';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default class DeckOut extends GameComponent {
  constructor(props) {
    super(props);
    if (this.getMyUserId() === this.getSessionCreatorUserId()) {
      // Creates deck and hands for all users
      let deck = [];
      for(var i = 0; i < 30; i++) {
        deck.push("Blank");
      }
      let users = this.getSessionUserIds();
      let playerHands = {};
      for(var j = 0; j < users.length; j++) {
        playerHands[users[j]] = [];
        for(var k = 1; k <= 5; k++) {
          let randomNumber = Math.floor(Math.random() * deck.length)
          playerHands[users[j]].push(deck[randomNumber]);
          deck.splice(randomNumber, 1);
        }
      }
      this.getSessionDatabaseRef().set({
        currentTurn: UserApi.getName(this.getSessionCreatorUserId()),
        deck: deck,
        hands: playerHands,
      });

    }
  }

  onSessionDataChanged(data) {
    this.setState(data);
    console.log(this.state);
  }

  render() {
    if (this.state.hands) {
      return (
        <div className="container">
        <hr/>
          {this.renderSessionInfo()}
          <hr/>
          Cards remaining: {this.state.deck.length}
          <div className="row">
            <div className="col-4">{this.renderPlayerHand()}</div>
          </div>
        </div>
      )
    } else {
      console.log("loading");
      return <p>Loading</p>
    }    
  }

    renderSessionInfo() {
      var id = this.getSessionId();
      var users = this.getSessionUserIds().map((user_id) => {
        if (this.getSessionCreatorUserId() !== user_id) {
          return <li key={user_id}>{UserApi.getName(user_id)}</li>
        } else {
          return <li key={user_id}><b>{UserApi.getName(user_id)} (Host)</b></li>
        }
      });
      return (
        <div className="row">
          <div className="col-4">
            <h1>
              Deck-Out!
            </h1>
          </div>
          <div className="col-4">          
            <p>Session ID:
              <b>{id}</b>
            </p>
          </div>
          <div className="col-4">
            <p>Session users:</p>
            <ul className="list-inline">
              {users}
            </ul>
          </div>
        </div>
      );
    }
    
    renderPlayerHand() {
      let user = this.getMyUserId();
      let hand = this.state.hands[user];
      /*
      for(var i = 0; i < this.state.hands.length; i++) {
        if (this.state.hands[i].user === this.getMyUserId()) {
          hand = this.state.hands[i].cards;
          console.log(hand);
          break;
        }
      }
      */
      console.log(hand);
      var hand_list = hand.map((card) => {
        return ( <li key={Math.random()} className="list-group-item">
          <button className={card}>{card}</button>
        </li>
      )});
      return (
        <ul className="list-group">
          {hand_list}
        </ul>
      )
    }
    

  }