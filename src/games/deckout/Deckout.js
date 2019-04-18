import GameComponent from '../../GameComponent.js';
import React from 'react';
import UserApi from '../../UserApi.js';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default class DeckOut extends GameComponent {
  constructor(props) {
    super(props);
    if (this.getMyUserId() === this.getSessionCreatorUserId()) {
      let deck = [];
      for(var i=0; i<=30; i++) {
        deck.push("blank")
      }
      this.getSessionDatabaseRef().set({
        deck: this.deck,
      });
    }
  }


  render() {
    return (
      <div className="container">
       {this.renderSessionInfo()}
      </div>

    )
  }

   renderSessionInfo() {
      console.log(this.getSessionDatabaseRef());
      var id = this.getSessionId();
      var users = this.getSessionUserIds().map((user_id) => (
        <li key={user_id}>{UserApi.getName(user_id)}</li>
      ));
      var creator = UserApi.getName(this.getSessionCreatorUserId());
      return (
        <div>
          <p>Session ID: {id}</p>
          <p>Session creator: {creator}</p>
          <p>Session users:</p>
          <ul>
            {users}
          </ul>
        </div>
      );
    }
  }