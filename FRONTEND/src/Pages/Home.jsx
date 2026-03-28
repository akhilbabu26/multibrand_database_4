import React from 'react'
import Navbar from "../components/layout/Navbar/Navbar"
import FourCard from "../features/products/FourCard"
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