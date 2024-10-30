import React, { createContext, useState, useRef, useEffect } from 'react'
import useAuthState from '../stores/auth'
import useSnackbarState from '../stores/snackbar'

const VideoChatContext = createContext()

function VideoChatContextProvider({ children }) {
  const { open } = useSnackbarState()
  const { getUserId } = useAuthState()

  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [stream, setStream] = useState()
  const streamRef = useRef()
  const myVideo = useRef()
  const userVideo = useRef()
  const myPeer = useRef()
  const [peer, setPeer] = useState(null)

  const [settings, setSettings] = useState({
    video: true,
    audio: true,
  })

  const answerCall = dial => {
    setCallAccepted(true)
    dial.answer(streamRef.current)

    dial.on('stream', remoteStream => {
      userVideo.current.srcObject = remoteStream
    })

    dial.on('error', error => {
      console.log(
        '🚀 ~ file: videoChatContext.js:42 ~ answerCall ~ error:',
        error,
      )
      const message = `'Error occurred:' ${error}`
      open('error', message)
    })

    dial.on('close', () => {
      // Call ended, perform cleanup or handle the event
      setCallAccepted(false)
      setCallEnded(true)
      dial.close()
    })
  }

  useEffect(() => {
    const initializePeer = async () => {
      try {
        const peerjs = await import('peerjs') // Import Peer.js dynamically
        setPeer(peerjs) // Set Peer.js to state
      } catch (error) {
        open('error', 'Error importing Peer.js:', error)
      }
    }

    initializePeer()

    const getMediaStream = async () => {
      try {
        const mediaConstraints = {
          video: settings.video,
          audio: settings.audio,
        }

        const localStream = await navigator.mediaDevices.getUserMedia(
          mediaConstraints,
        )
        setStream(localStream)
        streamRef.current = localStream
        if (myVideo.current) {
          myVideo.current.srcObject = localStream
        }
      } catch (error) {
        const message = `'Error accessing media devices:' ${error}`
        open('error', message)
      }
    }

    getMediaStream()

    if (peer) {
      const thisPeer = new peer.Peer(getUserId(), {
        host: '/localhost',
        port: '3000',
        path: '/peerjs',
      })

      myPeer.current = thisPeer

      myPeer.current.on('call', answerCall)

      return () => {
        myPeer.current.off('call', answerCall)

        myPeer.current.destroy()

        if (streamRef.current) {
          const tracks = streamRef.current.getTracks()

          tracks.forEach(track => track.stop())

          streamRef.current = null
          setStream(null)
        }
      }
    }
  }, [peer])

  const handleStream = remoteStream => {
    setCallAccepted(true)
    if (userVideo.current) {
      userVideo.current.srcObject = remoteStream
    }
  }

  const handleClose = () => {
    // Call ended, perform cleanup or handle the event
    setCallAccepted(false)
    setCallEnded(true)
  }

  const dialRef = useRef()

  const callUser = id => {
    if (dialRef.current) {
      dialRef.current.close()
    }

    if (myPeer.current && stream) {
      if (!dialRef.current) {
        dialRef.current = myPeer.current.call(id, stream)
      }

      if (dialRef.current) {
        dialRef.current.on('stream', handleStream)
        dialRef.current.on('close', handleClose)
        dialRef.current.on('error', error => {
          console.log(
            '🚀 ~ file: videoChatContext.js:142 ~ callUser ~ error:',
            error,
          )
          const message = `'Error occurred:' ${error}`
          open('error', message)
        })
      }
    }
  }

  const leaveCall = () => {
    if (dialRef.current) {
      dialRef.current.close()
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    if (myPeer.current) {
      myPeer.current.disconnect()
    }

    setCallAccepted(false)
    setCallEnded(true)
  }

  function toggleVideo() {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      if (videoTracks.length > 0) {
        // Toggle the video track on or off
        videoTracks[0].enabled = !videoTracks[0].enabled
      }
    }
  }

  function toggleAudio() {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length > 0) {
        // Toggle the audio track on or off
        audioTracks[0].enabled = !audioTracks[0].enabled
      }
    }
  }

  useEffect(() => {
    toggleVideo()
  }, [settings.video])

  useEffect(() => {
    toggleAudio()
  }, [settings.audio])

  return (
    <VideoChatContext.Provider
      value={{
        callAccepted,
        myVideo,
        userVideo,
        stream,
        callEnded,
        callUser,
        leaveCall,
        settings,
        setSettings,
        setCallAccepted,
        setCallEnded,
      }}
    >
      {children}
    </VideoChatContext.Provider>
  )
}

export { VideoChatContextProvider, VideoChatContext }
