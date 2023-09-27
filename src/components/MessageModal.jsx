import React, { useState, useEffect } from 'react';
import Select from "react-select"
import axios from "axios";
const MessageModal = ({ open, handleClose }) => {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("")
  const [cities, setCities] = useState([])
  const [city, setCity] = useState("")
  const [categoryValue, setCategoryValue] = useState("")
  const [subCategoryValue, setSubCategoryValue] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const category = [
    { value: "NGO", label: "Non-Governmental Organization (NGO)" },
    { value: "coaching and mentoring", label: "Coaching and mentoring" },
    { value: "health", label: "Health" },
    { value: "leadership development", label: "Leadership development" },
    { value: "law", label: "Law" },
    { value: "information technology", label: "Information technology" },
    { value: "others", label: "Others" },
  ]
  const subCategory = [
    { value: "human right awareness", label: "Human right awareness" },
    { value: "social policy", label: "Social Policy" },
    { value: "criminal justice", label: "Criminal Justice" },
    { value: "human right action", label: "Human Right Action" },
    { value: "environment", label: "Environment" },
    { value: "health", label: "Health" },
    { value: "disability", label: "Disability" },
    { value: "equality", label: "Equality" },
    { value: "others", label: "Others" },
  ]

  useEffect(() => {
    // Get countries
    axios
      .get(window.location.origin + "/api/getCountries")
      .then((res) => {
        const calculated = res.data.map((country) => ({ label: country, value: country }))
        setCountries(calculated)
      })
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    // Get countries
    if (country) {
      axios
        .get(`${window.location.origin}/api/getState?country=${country}`)
        .then((res) => {
          const calculated = res.data.map((state) => ({ label: state, value: state }))
          setCities(calculated)
        })
        .catch((err) => console.log(err))
    }
  }, [country])

  const sendMessage = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(
        "https://shark-app-28vbj.ondigitalocean.app/v1/admin/send-message",
        {
          category: categoryValue,
          subCategory: subCategoryValue,
          country,
          city,
          message
        }
      );
      setLoading(false)
      console.log(data);
      handleClose()
    } catch (err) {
      console.log(err)
    }
  }

  

  return (
    <div className=''>
      {open &&
        <div>
          <div onClick={handleClose} className='fixed top-0 left-0 h-screen w-screen bg-[#15121252]'></div>
          <div className='absolute top-20 bg-white w-[40%] rounded-md left-[30%] right-[30%] mx-auto my-auto'>
            <div className=''>
              <div className='p-4'>
                <div className='my-3'>
                  <p>Select Category</p>
                  <Select
                    className="mb-4"
                    classNamePrefix="select"
                    onChange={(val) => setCategoryValue(val.value)}
                    isClearable={true}
                    isSearchable={true}
                    name="color"
                    options={category}
                  />
                </div>
                {/* {categoryValue === "NGO" ? ( */}
                <div>
                  <p>Select Sub Category</p>
                  <Select
                    className="mb-4"
                    classNamePrefix="select"
                    onChange={(val) => setSubCategoryValue(val.value)}
                    isClearable={true}
                    isSearchable={true}
                    name="color"
                    options={subCategory}
                  />
                </div>
                {/* ) : null} */}
                <div className='my-3'>
                  <p>Select Country</p>
                  <Select options={countries} onChange={(e) => { setCountry(e?.value) }} />
                </div>
                <div className='my-2'>
                  <p>Select State</p>
                  <Select options={cities} onChange={(e) => setCity(e?.value)} />
                </div>
              </div>
              <textarea onChange={e => setMessage(e.target.value)} placeholder='Wrire a Message' className='w-full h-44 p-3 border-t'></textarea>
              <div className='flex p-4 justify-between'>
                <div></div>
                <button onClick={() => sendMessage()}>{loading ? 'loading...' : 'Send'}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default MessageModal;