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
        currentTurn: 1,
        deck: deck,
        hands: playerHands,
        currentPlayer: UserApi.getName(users[0]),

      });

    }
  }

  onSessionDataChanged(data) {
    this.setState(data);
  }

  render() {
    if (this.state) {
      console.log(this.state);
      return (
        <div className="container">
        <hr/>
          {this.renderSessionInfo()}
          <hr/>
          Cards remaining: {this.state.deck.length}
          <div className="row">
            <div className="col-4">{this.renderPlayerHand()}</div>
            <div className="col-8">
              <textarea className="log" rows="10" readonly></textarea>
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
              Player Turn: {this.state.currentPlayer}
            </p>
          </div>
          <div className="col-4">
            <p>Players: {users}</p>  
          </div>
        </div>
      );
    }
    
    renderPlayerHand() {
      let user = this.getMyUserId();
      let hand = this.state.hands[user];
      console.log(hand);
      var hand_list = hand.map((card) => {
        return (
          <div className="card" key={Math.random()}>
              <li className="list-group-item">
                <h5 className="card-title">{card}</h5>
                <button className={card} className="btn btn-success" onClick={() => {this.handleCardPlayed("blank")}}>Play Card</button>
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
    
    playerTurn(){
      if(this.state.currentTurn%2 === 0){
        return UserApi.getName(this.getSessionCreatorUserId())
      }else{  
       return UserApi.getName(this.getMyUserId()) 
      }
    }

    //Shold disable the cards on other player turn
    oneCard(){
      if(this.state.currentPlayer === this.getMyUserId){
  
      }
    }

    handleCardPlayed(card) {
      //doCardEffect(card)
      let currentUserHand = this.state.hands[this.getMyUserId()];
      let indexOfCardPlayed = currentUserHand.indexOf(card);
      currentUserHand.splice(indexOfCardPlayed, 1);
      let newTurn = this.state.currentTurn + 1;
      let drawDeck = this.state.deck -1;
      this.getSessionDatabaseRef().update({
        currentTurn: newTurn,
        hands: {
          [this.getMyUserId()]: currentUserHand
        },
        currentPlayer: this.playerTurn(),
      });
    }

  }