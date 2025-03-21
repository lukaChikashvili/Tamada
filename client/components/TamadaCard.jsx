import Image from 'next/image'
import React from 'react'

const TamadaCard = ({value}) => {
  return (
    <div className=''>
      <Image src = {value.img} alt = {value.name} width = {300} height = {50} />
    </div>
  )
}

export default TamadaCard
