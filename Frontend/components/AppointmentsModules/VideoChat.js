/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import {
  Button,
  Grid,
  IconButton,
  ListItem,
  List,
  Card,
  CardActions,
  CardActionArea,
} from '@material-ui/core'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VideocamIcon from '@material-ui/icons/Videocam'
import MicIcon from '@material-ui/icons/Mic'
import StopIcon from '@material-ui/icons/Stop'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import MicOffIcon from '@material-ui/icons/MicOff'
import { useRouter } from 'next/router'
import useCountdownTimer from '../../hooks/useCountdownTimer'
import { VideoChatContext } from '../../context/videoChatContext'
import useAuthState from '../../stores/auth'
import socket from '../../utils/socket'
import { PatientPageComponent } from '../../pages/shops/[shopId]/patients'

const useStyles = makeStyles(theme => ({
  controls: {
    justifyContent: 'center',
  },
  button: {
    margin: theme.spacing(1),
  },
}))

export default function VideoChat({ appointment, setFormState }) {
  const classes = useStyles()
  const { getUserId } = useAuthState()

  const { remainingTime, formattedRemainingTime } = useCountdownTimer(
    new Date(appointment.date),
  )

  const router = useRouter()

  const {
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    stream,
    callUser,
    settings,
    setSettings,
    leaveCall,
    setCallAccepted,
    setCallEnded,
  } = useContext(VideoChatContext)

  const [roomMembers, setRoomMembers] = useState([])

  const [isDoctorInRoom, setIsDoctorInRoom] = useState(false)
  const [isUserInRoom, setIsUserInRoom] = useState(false)

  const [waiting, setWaiting] = useState(true)
  const roomRef = useRef(null)

  useEffect(() => {
    socket.on('userJoined', data => {
      console.log('userJoined', data)

      setRoomMembers(data.members)

      roomRef.current = data.roomName
    })

    socket.on('userLeft', members => {
      console.log('userLeft', members)
      setRoomMembers(members)
      setCallAccepted(false)
      setCallEnded(true)
    })

    return () => {
      const currentRoom = roomRef.current

      if (currentRoom) {
        socket.emit('leaveRoom', {
          roomName: currentRoom,
          userId: getUserId().toString(),
        })
      }
    }
  }, [])

  useEffect(() => {
    setIsDoctorInRoom(
      roomMembers.some(
        memberId => memberId.toString() === getUserId().toString(),
      ),
    )
    setIsUserInRoom(
      roomMembers.some(
        memberId => memberId.toString() === appointment?.user?._id.toString(),
      ),
    )
  }, [roomMembers])

  useEffect(() => {
    if (isDoctorInRoom && isUserInRoom) {
      // start video chat
      console.log('call user now')
      callUser(appointment.user._id)
    } else {
      setWaiting(true)
    }
  }, [isDoctorInRoom, isUserInRoom])

  const toggleVideo = () => {
    setSettings({ ...settings, video: !settings.video })
  }

  const toggleAudio = () => {
    setSettings({ ...settings, audio: !settings.audio })
  }

  useEffect(() => {
    if (appointment?.user?._id) {
      const { shopId } = router.query
      const pathname = `/shops/${shopId}/consultation`
      router.push({
        pathname,
        query: { patient: appointment.user._id.toString() },
      })
    }
  }, [])

  return (
    <>
      <Grid container spacing={2} justifyContent="space-around">
        <Grid item xs={6}>
          <List>
            <ListItem>Video chat with {appointment.user.fullName}</ListItem>
            <ListItem>Start time: {formattedRemainingTime}</ListItem>
          </List>
        </Grid>
        <Grid item xs={6}>
          <Grid container item xs={12} justifyContent="flex-end" spacing={2}>
            <Grid item>
              {isDoctorInRoom ? (
                <Button
                  disableElevation
                  variant="contained"
                  style={{ color: 'red' }}
                  className={classes.button}
                  startIcon={<StopIcon />}
                  onClick={() => {
                    leaveCall(appointment.user._id)
                    setFormState('list')
                  }}
                >
                  Leave Call
                </Button>
              ) : (
                <Grid container spacing={2} /* direction="column" */>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      onClick={() =>
                        socket.emit('joinRoom', {
                          roomName: appointment._id,
                          userId: getUserId().toString(),
                        })
                      }
                    >
                      Join call
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={() => {
                        setFormState('list')
                      }}
                    >
                      Back
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        {stream && (
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardActionArea>
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  controls
                  className="video"
                />
              </CardActionArea>
              <CardActions className={classes.controls}>
                <IconButton
                  color="primary"
                  className={classes.iconButton}
                  onClick={toggleVideo}
                  disabled={!settings.audio}
                >
                  {settings.video ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
                <IconButton
                  color="primary"
                  className={classes.iconButton}
                  onClick={toggleAudio}
                  disabled={!settings.video}
                >
                  {settings.audio ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        )}
        {callAccepted && !callEnded && (
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardActionArea>
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  muted
                  controls
                  className="video"
                />
              </CardActionArea>
            </Card>
          </Grid>
        )}
      </Grid>

      <PatientPageComponent />

      <style jsx>{`
        .video {
          max-width: 100%;
          width: 100%;
        }

        @media (max-width: 600px) {
          /* Adjust dimensions for smaller screens */
          .video {
            max-width: 100%;
            width: 100%;
            height: auto; /* Maintain aspect ratio */
          }
        }
      `}</style>
    </>
  )
}
