import 'regenerator-runtime/runtime'
import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import {v4 as uuidv4} from "uuid";

const SUGGESTED_DONATION = '1'
const UNIVERSITY_LIST = 'POLITEHNICA BUCHAREST'
const BOATLOAD_OF_GAS = Big(1).times(10 ** 16).toFixed()
const TIME = new Date()


const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    
    contract.getMessages().then(setMessages)
  }, [])

  const onSubmit = useCallback(e => {
    e.preventDefault()

    const { fieldset, message, univ, donation } = e.target.elements

    fieldset.disabled = true

    
    contract.addMessage(
      { text: message.value },
      BOATLOAD_OF_GAS,
      Big(donation.value || '0').times(10 ** 24).toFixed()
    ).then(() => {
      contract.getMessages().then(messages => {
        setMessages(messages)

        message.value = ''
        univ.value = UNIVERSITY_LIST
        donation.value = SUGGESTED_DONATION
        fieldset.disabled = false
        message.focus()
      })
    })
  }, [contract])

  const signIn = useCallback(() => {
    wallet.requestSignIn(
      nearConfig.contractName,
      'NEAR Student Assembly'
    )
  }, [])

  const signOut = useCallback(() => {
    wallet.signOut()
    window.location = '/'
  }, [])

  return (
    <main>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1>NEAR Student Assembly</h1>
        {currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>
      {currentUser && (
        <form onSubmit={onSubmit}>
          <fieldset id="fieldset">
            <p>Make your voice heard, { currentUser.accountId }!</p>
            <p className="highlight">
              <label htmlFor="message">Message:</label>
              <input
                autoComplete="off"
                autoFocus
                id="message"
                required
              />
            </p>
            <p>
              <label htmlFor="univ">University:</label>
              <input
                autoComplete="off"
                defaultValue={UNIVERSITY_LIST}
                id="univ"
              />
            </p>
            
            <p>
              <label htmlFor="donation">Donation (optional):</label>
              <input
                autoComplete="off"
                defaultValue={SUGGESTED_DONATION}
                id="donation"
                max={Big(currentUser.balance).div(10 ** 24)}
                min="0"
                step="0.01"
                type="number"
              />
              <span title="NEAR Tokens">Ⓝ</span>
            </p>
            <p>
              <p>Your unique identifier:</p>
              {uuidv4()}<br/>
            </p>
            <button type="submit">
              Sign
            </button>
          </fieldset>
        </form>
      )}
      {!!messages.length && (
        <>
          <h2>Messages</h2>
          
          {messages.map((message, i) =>
            
            <p key={i} className={message.premium ? 'is-premium' : ''}>
              <strong>{message.sender}</strong>:<br/>
              {message.text}<br/>
              <p>University: {univ.value} </p>
              <p>Current Time: {TIME.toString()} </p>
              <button type="submit">
               Upvote this post :)
              </button>
            </p>
            
          )}
        </>
      )}
    </main>
  )
}

App.propTypes = {
  contract: PropTypes.shape({
    addMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
}

export default App
