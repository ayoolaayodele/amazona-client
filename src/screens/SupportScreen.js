import React from 'react';

import MessageBox from '../components/MessageBox';

export default function SupportScreen() {
  return (
    <div className='row top full-container'>
      <div className='col-1 support-users'>
        {users.filter((x) => x._id !== userInfo._id).length === 0 && (
          <MessageBox>No Online User Found</MessageBox>
        )}
        <ul>
          {users
            .filter((x) => x._id !== userInfo._id)
            .map((user) => (
              <li
                key={user._id}
                className={user._id === selectedUser._id ? '  selected' : '  '}>
                <button
                  className='block'
                  type='button'
                  onClick={() => selectUser(user)}>
                  {user.name}
                </button>
                <span
                  className={
                    user.unread ? 'unread' : user.online ? 'online' : 'offline'
                  }
                />
              </li>
            ))}
        </ul>
      </div>
      <div className='col-3 support-messages'>
        {!selectedUser._id ? (
          <MessageBox>Select a user to start chat</MessageBox>
        ) : (
          <div>
            <div className='row'>
              <strong>Chat with {selectedUser.name} </strong>
            </div>
            <ul ref={uiMessagesRef}>
              {messages.length === 0 && <li>No message.</li>}
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{`${msg.name}: `}</strong> {msg.body}
                </li>
              ))}
            </ul>
            <div>
              <form onSubmit={submitHandler} className='row'>
                <input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type='text'
                  placeholder='type message'
                />
                <button type='submit'>Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
