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
        currentTurn: 0,
        deck: deck,
        hands: playerHands,
      });

    }
  }

  onSessionDataChanged(data) {
    this.setState(data);
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
            <div className="col-8">

            </div>
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
      <div class="card">
  <div class="card-body">
    <h5 class="card-title">Blank</h5>
    <p class="card-text">Does Nothing.</p>
    <button class="btn btn-primary">Play Card</button>
  </div>
</div>
      */
      console.log(hand);
      var hand_list = hand.map((card) => {
        return (
          <div class="card">
              <li key={Math.random()} className="list-group-item">
                <h5 class="card-title">{card}</h5>
               <button className={card} class="btn btn-success">Play Card</button>
              </li>
          </div>
      )});
      return (
        <ul className="list-group">
          {hand_list}
        </ul>
      )
    }
    
    handleCardPlayed(card) {
      //doCardEffect(card)
      let currentUserHand = this.state.hands[this.getMyUserId()];
      let indexOfCardPlayed = currentUserHand.indexOf(card);
      if (indexOfCardPlayed > -1) {
        currentUserHand.splice(indexOfCardPlayed, 1);
      }
      let newTurn = this.state.currentTurn + 1;
      this.getSessionDatabaseRef().update({
        currentTurn: newTurn,
        hands: {
          [this.getMyUserId()]: currentUserHand
        }
      });
    }

  }