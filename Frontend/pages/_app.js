/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react'
//import { register } from 'next-offline/runtime'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { ThemeProvider, createTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { red } from '@material-ui/core/colors'
import isNode from 'is-node'
import useAuthState from '../stores/auth'
import useSnackbarState from '../stores/snackbar'
import socket from '../utils/socket'
import SnackBarNotification from '../components/custom/SnackbarNotification'
import 'react-datepicker/dist/react-datepicker.css'
//import Notification from '../components/Notification'
import OneSignal from 'react-onesignal'
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';



// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
})
export default function MyApp(props) {
  // if (!isNode) {
  //   register()
  // }


  const { Component, pageProps } = props

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const { isLoggedIn, getUserId } = useAuthState()
  const { open } = useSnackbarState()


  React.useEffect(() => {
    // Include OneSignal initialization code here
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/OneSignalSDKWorker.js').then(registration => {
          console.log('Service Worker registration successful onesignal:', registration);
        }).catch(error => {
          console.log('Service Worker registration failed onesignal:', error);
        });
      });
    }
  }, []);

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service worker registration successful:', registration);
          })
          .catch(error => {
            console.error('Service worker registration failed:', error);
          });
      });
    }
  }, []);



  React.useEffect(() => {
    const initializeOneSignal = async () => {
      const userId = getUserId()
      console.log("userId", userId)
      try {
        await OneSignal.init({
          //appId: 'ab32fef7-f162-469c-9d5f-3f0557b0427b',//dev
          appId: '04003cf5-9a4c-4a62-a223-2fac8c914e6f',
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true, size: 'medium', position: 'bottom-right', prenotify: true, showCredit: false },
          externalId: userId && userId
        });
        console.log("OneSignal initialized");
        OneSignal.Debug.setLogLevel('trace');

        let permission = await OneSignal.Notifications.permission;

        if (permission) {
          console.log(permission);
          console.log("Notifications allowed");
        } else {
          console.log("Notifications not allowed, requesting permission");
          await OneSignal.Notifications.requestPermission();
          OneSignal.Slidedown.promptPush();

        }

        if (userId) { await OneSignal.login(userId) };


        console.log("Prompting for subscription");

        // Handle incoming notifications
        OneSignal.on('notificationDisplay', (event) => {
          // Display the notification to the user
          console.log("cheking notification display", event);
          const { title, body } = event.notification.payload.content;
          alert('New Notification: ' + event.notification.payload.body);
          //toast.info('New Notification: ' + body);
          //open('success', body)
        });

        return () => {
          // Cleanup OneSignal
          OneSignal.off('notificationDisplay');
        };

      } catch (error) {
        console.error("Error initializing OneSignal:", error);
      }
    };

    initializeOneSignal();

  }, []);



  React.useEffect(() => {
    if (isLoggedIn()) {
      socket.emit('userConnect', getUserId())

      socket.on('connectionSuccess', () => {
        open('success', 'connection successful')
      })

      socket.on('orderCreated', productName => {
        const message = `${productName} has been ordered.`
        open('success', message)
      })

      socket.on('orderReceived', productName => {
        const message = `An order of ${productName} has been received.`
        open('success', message)
      })

      socket.on('prescriptionUploaded', () => {
        const message = 'New Prescription uploaded'
        open('success', message)
      })

      socket.on('prescriptionConfirmed', () => {
        const message = 'New prescription confirmed for purchase'
        open('success', message)
      })

      socket.on('prescriptionReceived', () => {
        const message = 'A prescription has been received'
        open('success', message)
      })
    }

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <Head>
        <title>Afyabook Pro</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=yes, viewport-fit=cover"
        />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <SnackBarNotification />

        {/* <Notification /> */}
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}
