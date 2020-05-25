import React, { Fragment } from "react";
import Header from "../components/Header";
import IndexNavbar from "../components/IndexNavbar";
import CreateRoom from "../containers/CreateRoom"

function Home() {
  return (
    <Fragment>
      <IndexNavbar />
      <div className="wrapper">
        <Header />
      </div>
    </Fragment>
  );
}

export default Home;
