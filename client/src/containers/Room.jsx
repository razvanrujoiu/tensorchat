import React, { Fragment, useEffect, useState, useRef } from "react";
import {
  Button,
  Alert,
  Modal,
  ModalBody,
  ModalFooter,
  Form,
  Input,
  FormGroup,
} from "reactstrap";
import Peer from "simple-peer";
import io from "socket.io-client";
import Clipboard from "react-clipboard.js";
const socket = io(process.env.REACT_APP_WS_URL);

var mqtt = require("mqtt");
var mqttClient = mqtt.connect("ws://test.mosquitto.org:8080");

mqttClient.on("connect", function () {
  console.log("Connected to mosquitto");
});

mqttClient.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString(), " in topic: ", topic.toString());
});

function Room(props) {
  let client = {},
    localStream;
  let hostStream = useRef(null);
  let remoteStream = useRef(null);
  let webShare = useRef(null);

  const roomName = props.match.params.roomname;
  const [roomExists, setRoomExists] = useState(true);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [roomUrl, setRoomUrl] = useState(window.location.href);
  const [gotStream, setGotStream] = useState(false);
  const hidden = gotStream ? "hidden" : "";
  const classNames = `v-container ${hidden} `;

  const getRoomStatus = () => {
    let roomName = localStorage.getItem("roomName");
    mqttClient.subscribe(roomName, function (err) {
      console.log("Subscribed to:", roomName);
    });
    // try {
    //   const response = await fetch("/room", {
    //     method: "POST",
    //     body: JSON.stringify({ roomName: roomName }),
    //     headers: {
    //       "Content-Type": "application/json"
    //     }
    //   });
    //   const json = await response.json();
    //   if (json.data.msg === "room_exists") {
    //     setRoomExists(true);
    //     getMedia();
    //   } else if (json.data.msg === "room_does_not_exist") {
    //     setRoomExists(false);
    //     setModalVisible(true);
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };

  useEffect(() => {
    getRoomStatus();
  });

  //handle modal close
  const handleClose = () => {
    setVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  //get access to media devices
  const getMedia = () => {
    navigator.getMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        //set media stream
        localStream = stream;
        hostStream.current.srcObject = stream;
        //subscribe to room
        socket.emit("subscribe", roomName);

        //peer constructor
        const initPeer = (type) => {
          let peer = new Peer({
            initiator: type === "init" ? true : false,
            stream: localStream,
            trickle: false,
          });
          peer.on("stream", (stream) => {
            setGotStream(true);
            remoteStream.current.srcObject = stream;
          });
          return peer;
        };

        //create initiator
        const createHost = () => {
          client.gotAnswer = false;
          let peer = initPeer("init");
          peer.on("signal", (data) => {
            if (!client.gotAnswer) {
              socket.emit("offer", roomName, data);
            }
          });
          client.peer = peer;
        };

        //create remote
        const createRemote = (offer) => {
          let peer = initPeer("notinit");
          peer.on("signal", (data) => {
            console.log("Create remote: " + data);
            socket.emit("answer", roomName, data);
          });
          peer.signal(offer);
          client.peer = peer;
        };

        //handle answer
        const handleAnswer = (answer) => {
          client.gotAnswer = true;
          let peer = client.peer;
          peer.signal(answer);
        };

        const session_active = () => {
          alert("session active");
        };

        //socket events
        // socket.on("create_host", createHost);
        // socket.on("new_offer", createRemote);
        // socket.on("new_answer", handleAnswer);
        // socket.on("end", end);
        // socket.on("session_active", session_active);
      })
      .catch((error) => {
        //error alerts
        setErrors({
          msg:
            "App needs permissions to access media devices to work! Try again.",
        });
        setVisible(true);
        console.log(error);
      });
  };
  const hangup = () => {
    socket.emit("user_disconnected", roomName);
    end();
  };

  //end connection
  const end = () => {
    window.location.href = "/";
  };

  //disable video
  const disableVideo = () => {
    let videoTracks = localStream.getVideoTracks();
    for (var i = 0; i < videoTracks.length; ++i) {
      videoTracks[i].enabled = !videoTracks[i].enabled;
    }
  };

  //disable audio
  const disableAudio = () => {
    let audioTracks = localStream.getAudioTracks();
    for (var i = 0; i < audioTracks.length; ++i) {
      audioTracks[i].enabled = !audioTracks[i].enabled;
    }
  };

  const showCheck = () => {
    webShare.current.className = "fas fa-clipboard-check";
    setTimeout(() => {
      webShare.current.className = "fas fa-share-alt";
    }, 2000);
  };

  const onSuccess = () => {
    setModalVisible(false);
  };

  //content to render
  const content = roomExists ? (
    <Fragment>
      <div className="hostStream">
        <video autoPlay={true} muted playsInline ref={hostStream}></video>
      </div>
      <Modal isOpen={modalVisible} toggle={handleModalClose}>
        <div className="modal-header">
          <h5 className="modal-title">Liv3</h5>
        </div>
        <ModalBody>
          <input
            autoFocus
            type="text"
            name="roomUrl"
            onChange={(e) => setRoomUrl(e.target.value)}
            className="form-control"
            value={roomUrl}
            style={{ color: "black" }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Clipboard
            className=" btn btn-info"
            data-clipboard-text={roomUrl}
            onSuccess={onSuccess}
          >
            Copy
          </Clipboard>
        </ModalFooter>
      </Modal>

      <Alert color="danger" isOpen={visible}>
        {errors.msg}
        <button onClick={handleClose} className="btn-round btn-icon close">
          <i className="fas fa-times"></i>
        </button>
      </Alert>

      <div role="group" id="actionbar">
        <Form>
          <FormGroup>
            <Input
            type="text"
            name="partnerId"
            id="partnerId"
            minLength="3"
            placeholder="Enter partner id"
            ></Input>
            <Button>Call</Button>
            <Button>Answer</Button>
          </FormGroup>
        </Form>
        <Button onClick={disableVideo}>
          Disable Video
          <i className="fas fa-video-slash"></i>
        </Button>
        <Button onClick={disableAudio}>
          Diable audio
          <i className="fas fa-microphone-slash"></i>
        </Button>
        <Button onClick={hangup} color="danger">
          {" "}
          Hangup
          <i className="fas fa-phone-slash"></i>
        </Button>
      </div>

      <div className="fullscreen-video-wrap">
        <video
          id="remoteStream"
          autoPlay={true}
          muted
          playsInline
          ref={remoteStream}
        ></video>
      </div>
    </Fragment>
  ) : (
    <Modal isOpen={modalVisible} toggle={handleModalClose} size="sm">
      <div className="modal-header">
        <h5 className="modal-title">Liv3</h5>
      </div>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={() => {
            props.history.push("/");
          }}
        >
          Home
        </Button>
        <Button
          color="secondary"
          onClick={() => {
            props.history.push("/createroom");
          }}
        >
          Create
        </Button>
      </ModalFooter>
    </Modal>
  );

  return <Fragment>{content}</Fragment>;
}

export default Room;
