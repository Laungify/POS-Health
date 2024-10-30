import { useState } from 'react'

function useConfirmationDialog() {
  const [isDialogOpen, setDialogOpen] = useState(false)

  const showConfirmationDialog = () => {
    setDialogOpen(true)
  }

  const hideConfirmationDialog = () => {
    setDialogOpen(false)
  }

  return {
    isDialogOpen,
    showConfirmationDialog,
    hideConfirmationDialog,
  }
}

export default useConfirmationDialog
