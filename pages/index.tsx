import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    window.location.replace("https://app.disco.xyz");
  }, []);
};

export default Home;
