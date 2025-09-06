import React from "react";

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>404 - Not Found</h2>
      <p>Sorry, the page does not exist!</p>
      <button className="btn btn-danger">
        <a href="/home" className="text-decoration-none text-white">
          Go to homepage
        </a>
      </button>
    </div>
  );
}

export default NotFound;
