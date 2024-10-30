/* eslint-disable no-underscore-dangle */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isEmptyObject } from '../utils/helpers'
import OneSignal from 'react-onesignal'

const useAuthState = create(
  persist(
    (set, get) => ({
      accountType: null,
      company: {},
      staff: {},
      token: null,
      getOwner: () => get().company?.owner || {},
      isLoggedIn: () => !!get().token,
      getUserName: () => {
        const userName = get().staff?.fullName || null
        return userName
      },
      getUserId: () => {
        const id = get().staff?._id || null
        return id
      },
      logIn: data => {
        get().logOut()
        set(() => ({ token: data.token }))
        set(() => ({ company: data.company }))
        set(() => ({ staff: data.staff }))
        set(() => ({
          accountType: isEmptyObject(data.company) ? 'staff' : 'company',
        }))
      },
      logOut: () => {
        set(() => ({ token: null }))
        set(() => ({ staff: {} }))
        set(() => ({ company: {} }))
        set(() => ({ accountType: null }))
        OneSignal.logout();
      },
      setStaff: staff => {
        set(() => ({ staff }))
      },
    }),
    {
      name: 'auth',
    },
  ),
)

export default useAuthState
