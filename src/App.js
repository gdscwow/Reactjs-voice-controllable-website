import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import { recognition, speak } from "./api/voiceRecognition";
import { addVideos } from "./redux/actionCreators/videosActionCreator";

import "./App.scss";

import Home from "./components/Home";
import InstructionScreen from "./components/InstructionScreen";
import Navbar from "./components/Navbar";
import Search from "./components/Search";
import CurrentVideo from "./components/CurrentVideo";
import OpenVideoHome from "./components/OpenVideo/OpenVideoHome";

const App = () => {
  const [greet, setGreet] = useState(false);
  const [stopReco, setStopReco] = useState(true);
  const [instructionsScreen, setInstructionScreen] = useState(true);
  const [openVideoHome, setOpenVideoHome] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const history = useHistory();
  const { videosLoading, videos, popularVideos } = useSelector(
    (state) => ({
      videosLoading: state.videos.videosLoading,
      videos: state.videos.videos,
      popularVideos: state.videos.popularVideos,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const Greet = async () => {
    await speak(
      "Welcome to the Voice controllable website. Please chekout the commands!. These commands will help you to controll website with voice!. Click on the Next button to start!.",
      stopReco,
      greet,
      setGreet,
      setStopReco
    );
  };

  useEffect(() => {
    if (!greet) {
      Greet();
    }
    if (videosLoading) {
      dispatch(addVideos());
    }
  }, [greet, dispatch]);

  // recognition properties and commands

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript;

    if (
      command.startsWith("navigate") ||
      (command.startsWith("go to") && !command.includes("search"))
    ) {
      let pageName;
      if (command.endsWith("page") || command.endsWith("route")) {
        pageName = !command.includes("homepage")
          ? command.split(" ")[command.split(" ").length - 2]
          : "home";
      } else {
        pageName = !command.includes("homepage")
          ? command.split(" ")[command.split(" ").length - 1]
          : "home";
      }
      if (pageName === "index" || pageName === "home") {
        history.push(`/`);
      } else {
        pageName = command.includes("about us")
          ? "about"
          : command.includes("contact us")
          ? "contact"
          : pageName;

        history.push(`/${pageName}`);
      }
    }

    if (command.startsWith("open video")) {
      if (window.location.pathname === "/") {
        if (command.includes("from")) {
          const currentCommand = command;
          const videoNo = currentCommand.match(/\d+/);
          const Package = command.split("from").reverse()[0];
          console.log(Package, command.match(/\d+/));
        } else {
          const videoNo = command
            .split("video")
            .reverse()[0]
            .split("")
            .reverse()[0];
          if (!openVideoHome) {
            setSelectedVideos([
              {
                from: "uploads",
                url: window.location.pathname,
                video: videos.slice(0, 5)[parseInt(videoNo) - 1],
              },
              {
                from: "popular uploads",
                url: window.location.pathname,
                video: popularVideos.slice(0, 5)[parseInt(videoNo) - 1],
              },
            ]);
            setOpenVideoHome(true);
          } else {
            history.push(
              `/video/${selectedVideos[parseInt(videoNo - 1)].video.id.videoId}`
            );
            setSelectedVideos(false);
            setOpenVideoHome(false);
          }
        }
      }
    }
  };

  recognition.onend = () => {
    recognition.start();
  };

  return (
    <div className="App">
      {instructionsScreen && (
        <InstructionScreen
          setInstructionScreen={setInstructionScreen}
          setStopReco={setStopReco}
        />
      )}
      {openVideoHome && (
        <OpenVideoHome
          setOpenVideoHome={setOpenVideoHome}
          selectedVideos={selectedVideos}
        />
      )}
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/video/:id">
          <CurrentVideo />
        </Route>
        <Route path="/search">
          <Search setStopReco={setStopReco} setGreet={setGreet} />
        </Route>
      </Switch>
    </div>
  );
};

export default App;
