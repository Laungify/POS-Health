import React from 'react'
import Layout from '../templates/layout'
import useAuthState from '../stores/auth'

export default function Home() {
  const { getUserName } = useAuthState()

  return (
    <div>
      <Layout>
        <h1>Dashboard</h1>
        <p>Welcome back {getUserName()}</p>
      </Layout>
    </div>
  )
}
