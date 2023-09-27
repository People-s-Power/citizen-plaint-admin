import React, { useState } from 'react';

const MessageModal = ({ open, data, handleClose }) => {

  return (
    <div className=''>
      {open &&
        <div>
          <div onClick={handleClose} className='fixed top-0 left-0 h-screen w-screen bg-[#15121252]'></div>
          <div className='absolute top-20 bg-white w-[40%] rounded-md left-[30%] right-[30%] mx-auto my-auto h-[80%]'>
            <div className=''>

            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default MessageModal;