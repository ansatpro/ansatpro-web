"use client";
// import LoginPage component
import LoginPage from "./auth/login/page";

const Home = () => {
  return (
    <div>
      <h1>Welcome to ANSAT Pro.</h1>
      <LoginPage /> {/* This will render the login page component */}
      <link></link>
    </div>
  );
};

export default Home;