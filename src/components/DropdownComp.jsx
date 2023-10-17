import React, { useState } from 'react';
import { Dropdown } from "rsuite";
import StartPetition from './modals/StartPetition';
import CreatePost from './modals/CreatePost';
import CreateAdvert from './modals/CreateAdvert';
import CreateEvent from './modals/CreateEvent';
import CreateVictories from './modals/CreateVictories';
import AddUpdates from './modals/AddUpdates';
const DropdownComp = ({ data, type }) => {
  const openModal = () => {

    if (type === "petition") {
      setOpenPetition(true)
    } else if (type === "advert") {
      setOpenAdvert(true)
    } else if (type === "post") {
      setOpenPost(true)
    } else if (type === "event") {
      setOpenEvent(true)
    } else if (type === "victory") {
      setOpenVictory(true)
    } else if (type === "update") {
      setOpenUpdate(true)
    }
  }


  const [openPetition, setOpenPetition] = useState(false)
  const [openPost, setOpenPost] = useState(false)
  const [openAdvert, setOpenAdvert] = useState(false)
  const [openEvent, setOpenEvent] = useState(false)
  const [openVictory, setOpenVictory] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)


  return (
    <div>

      <Dropdown.Item> <p onClick={() => { openModal() }} className="cursor-pointer">Edit</p> </Dropdown.Item>

      <StartPetition open={openPetition} handelClick={() => setOpenPetition(!openPetition)} data={data} />
      <CreatePost open={openPost} handelClick={() => setOpenPost(!openPost)} post={data} />
      <CreateAdvert open={openAdvert} handelClick={() => setOpenAdvert(!openAdvert)} advert={data} />
      <CreateEvent open={openEvent} handelClick={() => setOpenEvent(!openEvent)} event={data} />
      <CreateVictories open={openVictory} handelClick={() => setOpenVictory(!openVictory)} victory={data} />
      <AddUpdates open={openUpdate} handelClick={() => setOpenUpdate(!openUpdate)} update={data} />
    </div>
  );
};

export default DropdownComp;