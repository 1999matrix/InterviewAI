import React, { useState } from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "../../components/ui/Button";

function Profile() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(0);
  const [user] = useState("shash");
  let currentStreak = 50;
  let totalStreak = 365;
  const percentage = (currentStreak / totalStreak) * 100;

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

//   const uploadResumeFn = async (e: any) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("username", user);
//     if (file) {
//       formData.append("pdf_file", file);
//     }

//     try {
//       console.log("Uploading CV...");
//       console.log("FormData contents:", {
//         username: user,
//         fileSize: file ? file.size : "No file",
//         fileName: file ? file.name : "No file",
//       });

//       const resumeResult = await saveResume("upload_cv", formData);
//       console.log("Resume upload response:", resumeResult);
//     } catch (error) {
//       console.error("Error details:", {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//       });

//       alert(`Error: ${error.response?.data?.message || error.message}`);
//     }
//   };

  const renderSelection = () => {
    switch (currentSelection) {
      case 1:
        return (
          <div className="modal-overlay z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-gray-800 w-96 h-96 rounded-lg">
            <div className="modal-header flex justify-between items-center mx-3 my-4">
              <label className="block text-lg font-medium text-cyan-300">
                Upload Resume (PDF)
              </label>
              <Button
                onClick={() => {
                  setShowResumeModal(false);
                  console.log(showResumeModal);
                }}
                className="text-black text-2xl font-bold hover:text-gray-500"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4 mx-2 my-3">
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer
                      ${
                        fileName
                          ? "border-cyan-500 bg-gray-700/50"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                >
                  <div className="space-y-2 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-4h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm text-gray-400">
                      {fileName
                        ? fileName
                        : "Drop your PDF here, or click to browse"}
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-center items-center my-10">
            <Button
                //onClick={uploadResumeFn}
                className="w-44 p-3 rounded-xl transition-all duration-200 group bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/30 hover:from-cyan-700 hover:to-blue-700"
              >
                Upload Resume
              </Button>
            </div>
          </div>
        </div>
        );
        case 2:
          return (
            <div className="modal-overlay z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="modal-content bg-gray-800 w-96 h-96 rounded-lg">
                <div className="modal-header flex justify-between items-center mx-3 my-4">
                  <label className="block text-lg font-medium text-cyan-300">
                    Upload Work Experience
                  </label>
                  <Button
                onClick={() => {
                  setShowResumeModal(false);
                  console.log(showResumeModal);
                }}
                className="text-black text-2xl font-bold hover:text-gray-500"
              >
                ✕
              </Button>
                </div>
              </div>
            </div>
          );
          case 3:
            return (
              <div className="modal-overlay z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="modal-content bg-gray-800 w-96 h-96 rounded-lg">
                  <div className="modal-header flex justify-between items-center mx-3 my-4">
                    <label className="block text-lg font-medium text-cyan-300">
                      Add Education
                    </label>
                    <Button
                  onClick={() => {
                    setShowResumeModal(false);
                    console.log(showResumeModal);
                  }}
                  className="text-black text-2xl font-bold hover:text-gray-500"
                >
                  ✕
                </Button>
                  </div>
                </div>
              </div>
            );
            case 4:
              return (
                <div className="modal-overlay z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="modal-content bg-gray-800 w-96 h-96 rounded-lg">
                    <div className="modal-header flex justify-between items-center mx-3 my-4">
                      <label className="block text-lg font-medium text-cyan-300">
                        Add Links
                      </label>
                      <Button
                    onClick={() => {
                      setShowResumeModal(false);
                      console.log(showResumeModal);
                    }}
                    className="text-black text-2xl font-bold hover:text-gray-500"
                  >
                    ✕
                  </Button>
                    </div>
                  </div>
                </div>
              );
              case 5:
                return (
                  <div className="modal-overlay z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="modal-content bg-gray-800 w-96 h-96 rounded-lg">
                      <div className="modal-header flex justify-between items-center mx-3 my-4">
                        <label className="block text-lg font-medium text-cyan-300">
                          Add Skills
                        </label>
                        <Button
                      onClick={() => {
                        setShowResumeModal(false);
                        console.log(showResumeModal);
                      }}
                      className="text-black text-2xl font-bold hover:text-gray-500"
                    >
                      ✕
                    </Button>
                      </div>
                    </div>
                  </div>
                );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-3 mb-2">
      <div className="flex rounded-xl m-3">
        <div className="border shadow-md border-cyan-200 mx-2 rounded-lg w-1/3">
          <div className="p-6 col-span-1">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
                alt="Profile"
                className="rounded-full object-cover w-24 h-24 ring-2 ring-cyan-500"
              />
              <h2 className="text-xl font-bold text-cyan-500">
                Prashant Rajpoot
              </h2>
              <p className="text-gray-300">Software Engineer at Birlasoft</p>
            </div>
          </div>
        </div>

        <div className="border shadow-md border-cyan-200 rounded-lg w-2/3">
          <div className="p-9 flex justify-between">
            <div className="text-left ml-8">
              <h3 className="text-lg font-semibold text-cyan-500">
                Personal Information
              </h3>
              <p className="text-gray-300">📧 prashantrajpoot1931@gmail.com</p>
              <p className="text-gray-300">📞 +91-9892792581</p>
              <p className="text-gray-300">📍 India</p>
            </div>
            <div className="flex justify-center items-center mr-20">
              <div className="w-32 h-32 relative">
                <CircularProgressbar
                  value={percentage}
                  strokeWidth={8}
                  styles={buildStyles({
                    pathColor: "#4ade80",
                    trailColor: "#d1fae5",
                    textSize: "16px",
                  })}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500">
                  <span className="text-xs">STREAK</span>
                  <span className="text-xl font-bold">
                    {String(currentStreak).padStart(2, "0")}/{totalStreak}
                  </span>
                  <span className="text-xs">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showResumeModal && renderSelection()}

      <div className="space-y-6 flex">
        <div className="w-1/3 bg-gray-800 rounded-xl m-3">
          <div className="p-10 h-full flex flex-col justify-evenly">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                0
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Interviews
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                0
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Easy Interviews
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                0
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Intermediate Interviews
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                0
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Advanced Interviews
              </div>
            </div>
          </div>
        </div>
        <div className="w-2/3 flex flex-col">
          <div className="p-6 flex justify-between items-start border shadow-md border-cyan-200 mx-2 rounded-lg my-1">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-500">
                💼 Resume
              </h3>
              <p className="text-gray-500">Upload Your Resume</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button
                className="w-44 p-3 rounded-xl transition-all duration-200 grou shadow-lg"
                onClick={() => {
                  setShowResumeModal(true);
                  setCurrentSelection(1);
                }}
              >
                <div className="flex justify-center items-center">
                  {/* <div className="p-2 rounded-full bg-gray-700/50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div> */}
                  <h3 className="text-sm font-semibold ml-2">Upload CV</h3>
                </div>
              </Button>
            </motion.div>
          </div>

          <div className="p-6 flex justify-between items-start border shadow-md border-cyan-200 mx-2 rounded-lg my-1">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-500">
                💼 Work Experience
              </h3>
              <p className="text-gray-500">
                Add your work experience. Don’t forget to add those internships
                as well.
              </p>
            </div>
            <Button
              className="w-44 p-3 rounded-xl transition-all duration-200 grou shadow-lg"
              onClick={() => {
                setShowResumeModal(true);
                setCurrentSelection(2);
              }}
            >
              <div className="flex justify-center items-center">
                {/* <div className="p-2 rounded-full bg-gray-700/50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div> */}
                <h3 className="text-sm font-semibold ml-2">
                  Add work experience
                </h3>
              </div>
            </Button>
          </div>

          <div className="p-6 flex justify-between items-start border shadow-md border-cyan-200 mx-2 rounded-lg my-1">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-500">
                🎓 Education
              </h3>
              <p className="text-gray-500">
                We believe in skills over pedigree; but go ahead add your
                education for the recruiters who don’t.
              </p>
            </div>
            <Button
              className="w-44 p-3 rounded-xl transition-all duration-200 grou shadow-lg"
              onClick={() => {
                setShowResumeModal(true);
                setCurrentSelection(3);
              }}
            >
              <div className="flex justify-center items-center">
                {/* <div className="p-2 rounded-full bg-gray-700/50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div> */}
                <h3 className="text-sm font-semibold ml-2">Add Education</h3>
              </div>
            </Button>
          </div>

          <div className="p-6 flex justify-between items-start border shadow-md border-cyan-200 mx-2 rounded-lg my-1">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-500">
                🔗 Social Media Links
              </h3>
              <p className="text-gray-500">
                Add all the relevant links that help in knowing you.
              </p>
            </div>
            <Button
              className="w-44 p-3 rounded-xl transition-all duration-200 grou shadow-lg"
              onClick={() => {
                setShowResumeModal(true);
                setCurrentSelection(4);
              }}
            >
              <div className="flex justify-center items-center">
                {/* <div className="p-2 rounded-full bg-gray-700/50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div> */}
                <h3 className="text-sm font-semibold ml-2">Add Links</h3>
              </div>
            </Button>
          </div>

          <div className="p-6 flex justify-between items-start border shadow-md border-cyan-200 mx-2 rounded-lg my-1">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-cyan-500">
                🛠 My Skills
              </h3>
              <p className="text-gray-500">
                Add all the relevant skills that speak on your behalf.
              </p>
            </div>
            <Button
              className="w-44 p-3 rounded-xl transition-all duration-200 grou shadow-lg"
              onClick={() => {
                setShowResumeModal(true);
                setCurrentSelection(5);
              }}
            >
              <div className="flex justify-center items-center">
                {/* <div className="p-2 rounded-full bg-gray-700/50">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div> */}
                <h3 className="text-sm font-semibold ml-2">Add Skills</h3>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;