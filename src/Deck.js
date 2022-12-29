import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Card from './Card'
import './Deck.css'

const BASE_API_URL = "http://deckofcardsapi.com/api/deck"

function Deck() {
   const [deck, setDeck] = useState(null)
   const [drawn, setDrawn] = useState([])
   const [autoDraw, setAutoDraw] = useState(false)
   const timerRef = useRef(null)
   // returns {current: null}
   // current gets updated between renders
   // it persists between different renders
   // seperate from useState memory

   // fetch a new deck
   // side effect whenever setDeck changes
   useEffect(() => {
      async function getData() {
         let d = await axios.get(`${BASE_API_URL}/new/shuffle`)
         setDeck(d.data) // now, deck = d.data 
      }
      getData()
   }, [setDeck])

   // Draw one card every second if autoDraw is true
   useEffect(() => {
      // use deck_id from deck obj to draw a card
      // only allow drawCard if remaining !== 0
      async function drawCard() {
         let { deck_id } = deck

         try {
            let drawRes = await axios.get(`${BASE_API_URL}/${deck_id}/draw`)
            console.log(drawRes.data.cards)
            console.log(timerRef) // ????? incrementing but staying current?

            if (drawRes.data.remaining === 0) {
               setAutoDraw(false)
               throw new Error("no cards remaining!")
            }

            const card = drawRes.data.cards[0]

            setDrawn(d => [
               ...d,
               {
                  id: card.code,
                  name: card.value + " " + card.suit,
                  image: card.image
               }
            ])
         } catch (e) {
            alert(e)
         }
      }

      // if autoDraw === true, getCar() every second
      if (autoDraw && !timerRef.current) {
         timerRef.current = setInterval(async () => {
            await drawCard()
         }, 1000)
      }

      return () => {
         clearInterval(timerRef.current)
         timerRef.current = null
      }
   }, [autoDraw, setAutoDraw, deck])

   const toggleAutoDraw = () => {
      setAutoDraw(auto => !auto)
   }

   const cards = drawn.map(c => (
      <Card key={c.id} name={c.name} image={c.image} />
   ))


   return (
      <div className="Deck">
         {deck ? (
            <button className="Deck-button" onClick={toggleAutoDraw}>
               {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
            </button>
         ) : null}
         <div className="Deck-cardarea">{cards}</div>
      </div>
   )
}

export default Deck;