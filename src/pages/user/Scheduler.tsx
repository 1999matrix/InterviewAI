import React, { useState } from "react";
import Calendar from "react-calendar";
import TimePicker from "react-time-picker";
import Button from "../../components/ui/Button";
import "react-calendar/dist/Calendar.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const Scheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("10:10");

  // Combine date and time into one Date object
  const getCombinedDateTime = () => {
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const updatedDate = new Date(selectedDate);
    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);
    return updatedDate;
  };

  const handleSave = () => {
    const finalDateTime = getCombinedDateTime();
    alert(`Date saved: ${finalDateTime.toLocaleString()}`);
  };

  const handleCancel = () => {
    setSelectedDate(new Date());
    setSelectedTime("10:10");
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full bg-gradient-to-r from-blue-300 to-rose-100">
        <div className="text-center">
          <h2 className="text-lg font-bold text-red-700">
            Schedule the Mock Interview
          </h2>
          <p className="text-stone-700 text-sm mt-1">
            You have selected <span className="text-orange-900">{getCombinedDateTime().toLocaleString()}</span>
          </p>
        </div>

        <div className="mt-5 space-y-4 text-stone-700 flex justify-center gap-2 px-6">
          <Calendar
            //onChange={setSelectedDate}
            value={selectedDate}
            className="rounded-md border-2 border-gray-500 p-2 bg-gradient-to-r from-blue-200 to-rose-50"
          />

          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-stone-800 mb-1">
              Select Time
            </label>
            <TimePicker
              //onChange={setSelectedTime}
              value={selectedTime}
              disableClock={true}
              format="hh:mm a"
              className=""
              clearIcon={null}
            />

            <div className="flex flex-col gap-3 justify-between mt-20">
              <Button
                onClick={handleSave}
                className="bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 px-12"
              >
                SAVE
              </Button>
              <Button
                onClick={handleCancel}
                className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 px-10"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
