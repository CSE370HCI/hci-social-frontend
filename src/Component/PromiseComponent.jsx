import React, { useEffect } from "react";
import "../App.css";

const PromiseComponent = () => {
  // Promise function
  const promiseTest = (time, str) => {
    return new Promise(function (resolve, reject) {
      setTimeout(() => {
        console.log(str);
        resolve();
      }, time);
    });
  };

  useEffect(() => {
    // Execute promises
    promiseTest(3000, "One")
      .then(() => promiseTest(2000, "Two"))
      .then(() => promiseTest(1000, "Three"));
  }, []);

  return <p>Testing</p>;
};

export default PromiseComponent;