import type { NextPage } from "next";

import Button from "../components/Button";
import Input from "../components/Input";

const Home: NextPage = () => {
  return (
    <div>
      <Input />
      <Button buttonStyle="accent">Start experience</Button>
    </div>
  );
};

export default Home;
