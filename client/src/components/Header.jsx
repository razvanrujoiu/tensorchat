import React, { Fragment } from "react";
import { Button, Jumbotron } from "reactstrap";
import { Link } from "react-router-dom";
function Header() {
  return (
    <Fragment>
      <div className="page-header">
        <img
          alt="..."
          className="path"
          src={require("../assets/img/blob.png")}
        />

        <div className="content-center ">
          <Jumbotron style={{ backgroundColor: "transparent" }}>
            <h1 className="display-3">
              <span style={{ fontWeight: "bold" }}>Liv3</span>
            </h1>
           
            <Link to="/createroom">
              <Button>Get started</Button>
            </Link>

            <br />

            <a
              className="category text-success d-inline"
              style={{ cursor: "pointer" }}
              href="#howitworks"
            >
              Or learn more >
            </a>
          </Jumbotron>
        </div>
      </div>
    </Fragment>
  );
}

export default Header;
