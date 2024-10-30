import React, { useEffect, useRef, useState } from 'react'
import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom'
import useCurrentShopState from '../stores/currentShop'
import styled from "styled-components"

function Analytics({ filter, chartId, height, width }) {
  const { currentShop } = useCurrentShopState()
  //console.log("filter", filter)


  const sdk = new ChartsEmbedSDK({
    baseUrl: 'https://charts.mongodb.com/charts-ppblisting-mlimh',
  })
  const chartDiv = useRef(null)
  const [rendered, setRendered] = useState(false)
  const [chart] = useState(
    sdk.createChart({
      chartId: chartId,
      height,
      width,
      theme: 'light',
      showAttribution: false,
      maxDataAge: 300,
      autoRefresh: true,
      filter: { "shop": { $oid: currentShop._id } },

    }),
  )

  useEffect(() => {
    chart
      .render(chartDiv.current)
      .then(() => setRendered(true))
      .catch(err => console.log('Error during Charts rendering.', err))
  }, [chart])

  useEffect(() => {
    if (rendered) {
      chart
        .setFilter(filter)
        .catch(err => console.log('Error while filtering.', err))
    }
  }, [chart, filter, rendered])

  return (
    <div
      ref={chartDiv}
    />
  )
}

export default Analytics

const Wrapper = styled.div`
    margin: 1rem,
    background: #000,
    border-radius: 40px,
    box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2),

  @media screen and (min-width: 768px) {
    //width: 700px;
    //height: 700px;
    //background: '#000',
  }
`
