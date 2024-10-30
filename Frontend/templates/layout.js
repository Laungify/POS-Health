/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Collapse from '@material-ui/core/Collapse'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ReorderIcon from '@material-ui/icons/Reorder'
import { Box, IconButton } from '@material-ui/core'
import Hidden from '@material-ui/core/Hidden'
import EditIcon from '@material-ui/icons/Edit'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ExpandLess from '@material-ui/icons/ExpandLess'
import PropTypes from 'prop-types'
import EditShopModal from '../components/EditShopModal'
import CreateShopModal from '../components/CreateShopModal'
import API from '../utils/api'
import useAuthState from '../stores/auth'
import useCurrentShopState from '../stores/currentShop'
import useSnackbarState from '../stores/snackbar'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  /*  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  }, */
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  /* drawer: {
    width: drawerWidth,
    flexShrink: 0,
  }, */
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    padding: theme.spacing(3),
    overflow: 'auto',
  },
  activeLink: {
    color: 'red',
  },
}))

function NavList({ shop, openEditShopModal, roles }) {
  const router = useRouter()
  const { accountType } = useAuthState()

  const { setCurrentShop } = useCurrentShopState()

  const staffPages = [
    { text: 'Home', link: '' },
    { text: 'Inventory', link: 'inventory' },
    { text: 'Patients', link: 'patients' },
    { text: 'Consultation', link: 'consultation' },
    { text: 'Financials', link: 'financials' },
    { text: 'Suppliers', link: 'suppliers' },
    { text: 'Analytics', link: 'analytics' },
  ]

  const adminPages = [
    { text: 'Home', link: '' },
    { text: 'Inventory', link: 'inventory' },
    { text: 'Patients', link: 'patients' },
    { text: 'Staff', link: 'staff' },
    { text: 'Consultation', link: 'consultation' },
    { text: 'Financials', link: 'financials' },
    { text: 'Suppliers', link: 'suppliers' },
    { text: 'Analytics', link: 'analytics' },
  ]

  const [expand, setExpand] = useState(null)

  const goToPage = page => {
    const ref = `/shops/${shop._id}/${page.link}`
    setCurrentShop(shop)
    router.push(ref)
  }

  const isExpanded = shop._id === expand

  /*  useEffect(() => {
    setExpand(router.query?.shopId);
  }, []); */

  const hasAdminRights = !!roles.find(item => item === 'admin')

  return (
    <>
      {accountType === 'company' && (
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          style={{ paddingBottom: '20px' }}
        >
          <div>
            <ListItem
              button
              selected={router.query?.shopId === shop._id}
              onClick={() => setExpand(shop._id === expand ? null : shop._id)}
            >
              {shop.name}
              {isExpanded ? <ExpandMore /> : <ExpandLess />}
            </ListItem>
          </div>
          <IconButton onClick={() => openEditShopModal(shop)}>
            <EditIcon />
          </IconButton>

          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {hasAdminRights
              ? adminPages.map(page => (
                <ListItem
                  alignItems="center"
                  button
                  key={page.text}
                  onClick={() => goToPage(page)}
                >
                  <ListItemText primary={page.text} />
                </ListItem>
              ))
              : staffPages.map(page => (
                <ListItem
                  alignItems="center"
                  button
                  key={page.text}
                  onClick={() => goToPage(page)}
                >
                  <ListItemText primary={page.text} />
                </ListItem>
              ))}
          </Collapse>
        </Grid>
      )}

      {accountType === 'staff' && (
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          style={{ paddingBottom: '20px' }}
        >
          <ListItem
            button
            selected={router.query?.shopId === shop._id}
            onClick={() => setExpand(shop._id === expand ? null : shop._id)}
          >
            {shop.name}
            {isExpanded ? <ExpandMore /> : <ExpandLess />}
          </ListItem>

          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {hasAdminRights
              ? adminPages.map(page => (
                <ListItem
                  alignItems="center"
                  button
                  key={page.text}
                  onClick={() => goToPage(page)}
                >
                  <ListItemText primary={page.text} />
                </ListItem>
              ))
              : staffPages.map(page => (
                <ListItem
                  alignItems="center"
                  button
                  key={page.text}
                  onClick={() => goToPage(page)}
                >
                  <ListItemText primary={page.text} />
                </ListItem>
              ))}
          </Collapse>
        </Grid>
      )}
    </>
  )
}

export default function Layout({ children }) {
  const router = useRouter()
  const classes = useStyles()
  const { accountType, getUserId, logOut, isLoggedIn } = useAuthState()
  const [shops, setShops] = useState([])
  const [drawer, setDrawer] = useState(false)
  const [isCreateShopModalOpen, setIsCreateShopModalOpen] = useState(false)
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false)
  const [editShop, setEditShop] = useState({})

  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const fetchShops = async () => {
    setLoading(true)
    try {
      const result = await API.get(`staff/${getUserId()}/shops`)
      const details = result.data.data

      /* setShops(details.map(item => item.shop)) */
      setShops(details)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      return router.push('/login')
    }

    fetchShops()
  }, [])

  const toggleDrawerStatus = () => {
    setDrawer(!drawer)
  }

  const openCreateShopModal = () => {
    setIsCreateShopModalOpen(true)
  }

  const closeCreateShopModal = () => {
    setIsCreateShopModalOpen(false)
    fetchShops()
  }

  const openEditShopModal = shop => {
    setEditShop(shop)
    setIsEditShopModalOpen(true)
  }

  const closeEditShopModal = () => {
    setIsEditShopModalOpen(false)
    setEditShop({})
    fetchShops()
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar>
          <Hidden smUp>
            <IconButton onClick={toggleDrawerStatus}>
              <ReorderIcon />
            </IconButton>
          </Hidden>
          <Grid justifyContent="space-between" container>
            <Grid item>
              <Hidden xsDown>
                <Typography variant="h6" noWrap>
                  Pharmacy
                </Typography>
              </Hidden>
              <Hidden smUp>
                <Typography variant="h6" noWrap>
                  Pharmacy
                </Typography>
              </Hidden>
            </Grid>

            <Grid item>
              <Button
                style={{
                  backgroundColor: 'orange',
                }}
                onClick={() => {
                  logOut()
                  router.push('/login')
                }}
              >
                Log out
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <CreateShopModal
        open={isCreateShopModalOpen}
        closeModal={closeCreateShopModal}
      />

      <EditShopModal
        shop={editShop}
        open={isEditShopModalOpen}
        closeModal={closeEditShopModal}
      />

      {/* mobile */}
      <Hidden smUp>
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawer}
          onClose={toggleDrawerStatus}
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <div className={classes.toolbar} />

          <Divider />

          <Box m={2}>
            <List>
              <Link passHref href="/">
                <ListItem button>Dashboard</ListItem>
              </Link>
              <Link passHref href="/profile">
                <ListItem button>Profile</ListItem>
              </Link>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <h3>Pharmacy</h3>
                {accountType === 'company' && (
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={openCreateShopModal}
                  >
                    New Store
                  </Button>
                )}
              </Grid>

              {shops.map(item => (
                <NavList
                  key={item.shop._id}
                  shop={item.shop}
                  roles={item.roles}
                  openEditShopModal={openEditShopModal}
                  accountType={accountType}
                />
              ))}
            </List>
          </Box>
        </Drawer>
      </Hidden>

      {/* desktop */}
      <Hidden xsDown>
        <Drawer
          open
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          className={classes.drawer}
          anchor="left"
        >
          <div className={classes.toolbar} />

          <Divider />

          <Box m={2}>
            <List>
              <Link passHref href="/">
                <ListItem button>Dashboard</ListItem>
              </Link>
              <Link passHref href="/profile">
                <ListItem button>Profile</ListItem>
              </Link>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <h3>Pharmacy</h3>
                {accountType === 'company' && (
                  <div>
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      onClick={openCreateShopModal}
                    >
                      New Store
                    </Button>
                  </div>
                )}
              </Grid>
              {shops.map(item => (
                <NavList
                  key={item.shop._id}
                  shop={item.shop}
                  roles={item.roles}
                  openEditShopModal={openEditShopModal}
                  accountType={accountType}
                />
              ))}
            </List>
          </Box>
        </Drawer>
      </Hidden>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  )
}

NavList.propTypes = {
  shop: PropTypes.object.isRequired,
  openEditShopModal: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
}

Layout.propTypes = {
  children: PropTypes.array.isRequired,
}
