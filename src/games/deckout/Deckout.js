import GameComponent from '../../GameComponent.js';
import React from 'react';
import UserApi from '../../UserApi.js';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default class DeckOut extends GameComponent {
  constructor(props) {
    super(props);
    if (this.getMyUserId() === this.getSessionCreatorUserId()) {
      let deck = [];
      for(var i = 0; i < 30; i++) {
        deck.push("blank")
      }
      let users = this.getSessionUserIds();
      let playerHands = [];
      for(var j = 0; j < users.length; j++) {
        let userHand = {
          user: users[j],
          cards: [],
        };
        for(var k = 1; k <= 5; k++) {
          let randomNumber = Math.floor(Math.random() * deck.length)
          userHand.cards.push(deck[randomNumber]);
          deck.splice(randomNumber, 1);
        }
        playerHands.push(userHand);
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
  }

  render() {
    return (
      <div className="container">
      <hr/>
        {this.renderSessionInfo()}
        <hr/>
      </div>
    )
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
  }