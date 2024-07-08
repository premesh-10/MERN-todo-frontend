import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./Home.css"
import { useNavigate } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const taskRef = useRef(null);
  const dateTimeRef = useRef(null);
  //const timeRef = useRef(null);
  const [editingTask, setEditingTask] = useState(null);
  const notificationTimeouts = useRef({});
  const [isHovered, setIsHovered] = useState(false);





  useEffect(() => {
    fetchTasks();
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          alert("Please allow notification access");
        }
      });
    }
  }, [location]);

  useEffect(() => {
    // Clear previous timeouts
    Object.values(notificationTimeouts.current).forEach(clearTimeout);
    notificationTimeouts.current = {};

    tasks.forEach((task) => {
      const scheduleTime = new Date(task.dateTime);
      const currentTime = new Date();
      const timeDifference = scheduleTime - currentTime;

      if (timeDifference > 0) {
        const timeoutId = setTimeout(() => {
          document.getElementById("notificationSound").play();
          if (Notification.permission === "granted") {
            new Notification(("Time for ") + task.task + (" Task"), {
              requireInteraction: true,
            });
          } else {
            alert("Please allow notification access");
          }
        }, timeDifference);

        notificationTimeouts.current[task._id] = timeoutId;
      }
    });

    // Cleanup timeouts on unmount
    return () => {
      Object.values(notificationTimeouts.current).forEach(clearTimeout);
    };
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://mernbackendproject-5stk.onrender.com/tasks/");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const scheduleReminder = async () => {
    const title = taskRef.current.value;
    const dateTime = dateTimeRef.current.value;
    //const time = timeRef.current.value;
    //const dateTimeString = ${date} ${time};

    try {
      const response = await axios.post("https://mernbackendproject-5stk.onrender.com/tasks/create-task", {
        task: title,
        dateTime,
        //dateTime:dateTimeString,
      });
      console.log("Task created:", response.data);
      fetchTasks(); // Update tasks after creating a new one
    } catch (error) {
      console.error("Error creating task:", error);
    }
    window.location.reload();
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`https://mernbackendproject-5stk.onrender.com/tasks/delete-task/${id}`);
      fetchTasks(); // Update tasks after deleting one
    } catch (error) {
      console.error("Error deleting task:", error);
    }

  };

  const editTask = async (id) => {
    try {
      const response = await axios.get(`https://mernbackendproject-5stk.onrender.com/tasks/update-task/${id}`);
      const task = response.data;
      taskRef.current.value = task.task;
      dateTimeRef.current.value = task.dateTime.split(" ")[0];
      //timeRef.current.value = task.dateTime.split(" ")[1];
      setEditingTask(task);
    } catch (error) {
      console.error("Error fetching task for edit:", error);
    }
  };

  const updateTask = async () => {
    const title = taskRef.current.value;
    const dateTime = dateTimeRef.current.value;
    //const time = timeRef.current.value;
    //const dateTimeString = ${date} ${time};

    try {
      await axios.put(`https://mernbackendproject-5stk.onrender.com/tasks/update-task/${editingTask._id}`, {
        task: title,
        dateTime,
      });
      fetchTasks(); // Update tasks after updating one
      window.location.reload();
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };


  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };




  return (
    <div className="container-fulid">
      <nav class="navbar navbar-expand-lg navbar-light bg-primary">
        <div class="container-fluid">
          <span class="navbar-brand text-light" href="#">Welcome to To-do List Website</span>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <button onClick={() => navigate("/task")} class="nav-link active" aria-current="page" href="#" id="topbtn">Home</button>
              </li>
              <li class="nav-item">
                <button onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="nav-link"
                  class="nav-link active" href="#" id="topbtn">About us</button>
                {isHovered && (
                  <div className="hover-data">
                    <p style={{width:"20%"}}>Our To-Do List website allows users to manage tasks efficiently. Users can create, edit, and delete tasks, set reminders, and receive notifications for upcoming tasks. It's designed to help users stay organized and ensure they don't forget important activities. </p>

                  </div>
                )}
              </li>
              <li class="nav-item">
                <button onClick={() => navigate("/")} class="nav-link active" href="#" id="topbtn">Logout <img id="img" src="logout.png" alt=""></img></button>

              </li>

            </ul>
          </div>
        </div>
      </nav>
      <form>
        <div className="container" id="form">
          <label className="form-label" id="label">Task:</label>
          <input className="form-control mx-auto" type="text" ref={taskRef} id="input" />
          {/*<label className="form-label" id="label">Date:</label>
          <input className="form-control mx-auto" type="date" ref={dateRef} id="input" />*/}
          <label className="form-label" id="label">Date and Time:</label>
          <input className="form-control mx-auto" type="datetime-local" ref={dateTimeRef} id="input" />
          <button type="button" className="btn btn-warning my-3 d-block mx-auto" onClick={scheduleReminder} id="schedulebutton">
            Schedule Reminder
          </button>
          {editingTask && (
            <button type="button" className="btn btn-warning d-block mx-auto" onClick={updateTask}>
              Update Task
            </button>
          )}</div>
      </form>
      <audio id="notificationSound">
        <source src="notification_ding.mp3" type="audio/mpeg" />
      </audio>
      <table className="table table-bordered table-secondary table-striped">
        <thead>
          <tr>
            <th>Task</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.task}</td>
              <td>{task.dateTime}</td>
              <td>
                <button onClick={() => deleteTask(task._id)} className="btn btn-danger mx-2">Delete</button>
                <button onClick={() => editTask(task._id)} className="btn btn-success mx-2">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;


