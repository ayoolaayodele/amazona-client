import React, { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import { useSelector } from 'react-redux';
import MessageBox from '../components/MessageBox';

let allUsers = [];
let allMessages = [];
let allSelectedUser = {};
const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:5000'
    : window.location.host;

export default function SupportScreen() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  useEffect(() => {
    if (uiMessagesRef.current) {
      //When you select a user, it will scroll down to the recent message of the user
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }

    if (!socket) {
      const sk = socketIOClient(ENDPOINT);
      setSocket(sk);
      sk.emit('onLogin', {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });
      sk.on('message', (data) => {
        //it will check if the message is for current user
        if (allSelectedUser._id === data._id) {
          //concat the data: new message with prev message
          allMessages = [...allMessages, data];
        } else {
          //if the id does not equal to data.id, find in all users, the user that is equal to the id
          //of the current message

          const existUser = allUsers.find((user) => user._id === data._id);
          if (existUser) {
            //if the user exist, use map to mark the user as unread

            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? { ...user, unread: true } : user
            );
            setUsers(allUsers);
          }
        }
        setMessages(allMessages);
      });
      sk.on('updateUser', (updatedUser) => {
        const existUser = allUsers.find((user) => user._id === updatedUser._id);
        if (existUser) {
          //if user exist update the user in all user table
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? updatedUser : user
          );
          setUsers(allUsers);
        } else {
          //if user does not exist,  concatenate new users to all user
          allUsers = [...allUsers, updatedUser];
          //then update the status of users
          setUsers(allUsers);
        }
      });
      sk.on('listUsers', (updatedUsers) => {
        //update all users with updated users coming from server
        allUsers = updatedUsers;
        setUsers(allUsers); //set allUsers to update the UI
      });
      sk.on('selectUser', (user) => {
        //set messages coming from the current user
        allMessages = user.messages;
        setMessages(allMessages);
      });
    }
  }, [messages, socket, users, userInfo]);

  const selectUser = (user) => {
    //it updates allselected user with the selected user in the UI
    allSelectedUser = user;
    //it also updated the selected user in the react hook
    setSelectedUser(allSelectedUser);

    //check id of selected user if it exists
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        //set unread to false for the message has been read
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    socket.emit('onUserSelected', user);
  };

  //It sends a new message to the user in the list
  const submitHandler = (e) => {
    e.preventDefault();
    //if the message is empty
    if (!messageBody.trim()) {
      alert('Error. Please type message.');
    } else {
      //if the user enters message, update the message array
      allMessages = [
        ...allMessages,
        { body: messageBody, name: userInfo.name },
      ];
      setMessages(allMessages);
      setMessageBody(''); //clear entered message
      setTimeout(() => {
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name, //receiver of message
          isAdmin: userInfo.isAdmin, //type of sender
          _id: selectedUser._id, //sender of message
        });
      }, 1000);
    }
  };

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
