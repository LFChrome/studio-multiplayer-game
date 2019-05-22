import GameComponent from '../../GameComponent.js';
import React from 'react';
import UserApi from '../../UserApi.js';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './deckOut.css';

export default class DeckOut extends GameComponent {
  constructor(props) {
    super(props);
    if (this.getMyUserId() === this.getSessionCreatorUserId()) {
      // Creates deck and hands for all users
      let deck = [];
      for(var i = 0; i < 40; i++) {
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
      //*******************************************************************
      this.getSessionDatabaseRef().set({
        currentTurn: 1,
        deck: deck,
        hands: playerHands,
        currentPlayer: users[0],
        winner: "none",
      });

    }
  }

  onSessionDataChanged(data) {
    this.setState(data);
  }

  render() {
    if (this.state.deck) {
      if (this.state.winner === "none") {
        return (
          <div className="container">
          <hr/>
            {this.renderSessionInfo()}
            {this.renderGameScreen()}
          </div>
        )
      }
      else {
        return (
          <div className="container">
          <hr/>
            {this.renderSessionInfo()}
            {UserApi.getName(this.state.currentPlayer)} won!
          </div>
        )
      }
    } 
    else {
      return <p>Loading</p>
    }    
  }
  // Render the top bar with all the information
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
          <h3>
            Deck-Out!
          </h3>
        </div>
        <div className="col-4">          
          <p>Session ID:
            <b>{id}</b>
          </p>
          <p>
            Round: {this.state.currentTurn}
          </p>
          <p>
            Player Turn: {UserApi.getName(this.state.currentPlayer)}
          </p>
        </div>
        <div className="col-4">
          <p>Players: {users}</p>  
        </div>
      </div>
    );
  }
  // Renders the gamescreen
  renderGameScreen() {
    return (
      <div>
        <hr/>
        Cards remaining: {this.state.deck.length}
        <div className="row">
          <div className="col-4">{this.renderPlayerHand()}</div>
          <div className="col-8">
            <textarea className="log" rows="10" readOnly></textarea>
          </div>
        </div>
      </div>
    )
  }
  // Renders players' hands
  renderPlayerHand() {
    let user = this.getMyUserId();
    let user_hand = this.state.hands[user];
    var hand_list = user_hand.map((card) => {
      return (
        <div className="card" key={Math.random()}>
            <li className="list-group-item">
              <h5 className="card-title">{card}</h5>
              <button 
                className={card} className="btn btn-success" onClick={() => {this.handleCardPlayed("blank")}}
                disabled={this.state.currentPlayer !== this.getMyUserId()}
              >
                Play Card
              </button>
            </li>
        </div>
      )
    });
    return (
      <ul className="list-group">
        {hand_list}
      </ul>
    )
  }
  // Renders the user who won

  // Handle when a card is played
  handleCardPlayed(card) {
    var winner = "none";
    //doCardEffect(card)
    if (this.state.deck.length !== 0 ) {
      //*******************************************************************
      // Update the hand of the user who just played
      var currentUserHand = this.state.hands[this.getMyUserId()];
      let indexOfCardPlayed = currentUserHand.indexOf(card);
      currentUserHand.splice(indexOfCardPlayed, 1);
      //*******************************************************************
      // Advance one round
      var newTurn = this.state.currentTurn + 1;
      //*******************************************************************
      // Change the current user playing
      var newPlayer = this.state.users[this.state.currentTurn%this.state.users.length];
      //*******************************************************************
      // Give a card to the new player
      let cardDrawn = this.state.deck[0];
      this.state.hands[newPlayer].push(cardDrawn);
      this.state.deck.splice(0,1);
      var newDeck = this.state.deck;
      this.getSessionDatabaseRef().update({
        deck: newDeck,
      });
      var newPlayerHand = this.state.hands[newPlayer];
      //*******************************************************************
      if (this.state.deck.length == 0) {
        winner = newPlayer;
      }
    }
    // Update everything in the database
    this.getSessionDatabaseRef().update({
      currentTurn: newTurn,
      currentPlayer: newPlayer,
      winner: winner,
    });
    this.getSessionDatabaseRef().child('hands').update({
      [this.getMyUserId()]: currentUserHand,
      [newPlayer]: newPlayerHand
    });
    //*******************************************************************
  }

}