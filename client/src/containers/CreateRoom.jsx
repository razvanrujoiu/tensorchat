import React, { Fragment, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Label,
  FormGroup,
  Form,
  Input,
  Jumbotron,
  FormText,
  Alert
} from "reactstrap";

import IndexNavbar from "../components/IndexNavbar";

var mqtt = require('mqtt')
var client  = mqtt.connect('ws://test.mosquitto.org:8080')

client.on('connect', function() {
  console.log("Connected to mosquitto");
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString(), " in topic: ", topic.toString())
});

function CreateRoom(props) {
  const [inputs, setInputs] = useState({});
  const [visible, setVisible] = useState(false);
  //handle submission
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
      const data = {
        roomName: inputs.room
      };
      sendData(data);
    }
  };
  //handle input
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value
    }));
  };

  const handleClose = () => {
    setVisible(false);
  };
  const sendData = data => {
    try {
        client.subscribe(data.roomName, function (err) {
          if (!err) {
            localStorage.setItem('roomName', data.roomName);
            console.log("Subscribed succesfully")
            props.history.push(`/r/${data.roomName}`);
            
          }
        });
      // const response = await fetch("/createroom", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      //   headers: {
      //     "Content-Type": "application/json"
      //   }
      // });
      // const json = await response.json();
      // if (json.data.msg === "created") {
      //   props.history.push(`/r/${json.data.roomName}`);
      // } else if (json.data.msg === "duplicate") {
      //   setVisible(true);
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Fragment>
      <IndexNavbar />

      <div className="page-header">
        <div className="content-center mb-0 ">
          <Jumbotron style={{ backgroundColor: "transparent" }}>
            <Card className="card-coin card-plain">
              <CardHeader>
                <h1>Connect <i className="fas fa-rocket"></i></h1>
                <Alert color="danger" isOpen={visible}>
                  <strong>Room already exists! </strong>Please try again with a
                  unique name
                  <button onClick={handleClose} className="btn-round btn-icon alert-dismissible close"> <i className="fas fa-times"></i> </button>
                </Alert>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="room">Enter a room name</Label>
                    <Input
                      type="text"
                      name="room"
                      id="room"
                      value={inputs.room}
                      placeholder="e.g. room1"
                      required
                      onChange={handleInputChange}
                      minLength="3"
                    />
                  </FormGroup>
                  <Button type="submit">Go</Button>
                </Form>
              </CardBody>
            </Card>
          </Jumbotron>
        </div>
      </div>
    </Fragment>
  );
}
export default CreateRoom;
