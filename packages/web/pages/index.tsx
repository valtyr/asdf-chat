import Head from "next/head";
import Button from "../components/Button";
import Input from "../components/Input";
import Label from "../components/Label";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="max-w-lg">
        <Label htmlFor="username" label="Username" />
        <Input id="username" placeholder="Username" />
        <Button buttonStyle="primary">Start experience</Button>
      </div>
    </div>
  );
}
