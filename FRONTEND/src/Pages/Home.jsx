import React from 'react'
import Navbar from '../NavSections/NavBar/Navbar'
import FourCard from '../ShoeComponents/FourCard'
import FirstSection from './FirstSection'

function Home() {
  return (
    <div>
      <Navbar/>
      <FirstSection/>
      <FourCard/>
    </div>
  )
}

export default Home
