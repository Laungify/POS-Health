import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: "500px",
    width: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: "10px",
};

export default function BasicModal({ showShop }) {
    //console.log("shopshow see", showShop)

    return (
        <div>
            <Modal
                open={!showShop}
                //onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableEscapeKeyDown={true}
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Membership Fee
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Oops, Sorry your membership has not been updated.
                    </Typography>
                    <br />
                    <Button variant="contained" href="https://res.cloudinary.com/tripleaim-software/image/upload/v1665149912/Copy_of_Afyabook_invoice_1_b3conh.pdf" target="_blank">Generate Invoice</Button>
                </Box>
            </Modal>
        </div>
    );
}
