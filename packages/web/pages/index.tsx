import Head from "next/head";
import RequiresUsername from "../components/common/RequiresUsername";
import Button from "../components/widgets/Button";
import Input from "../components/widgets/Input";
import Label from "../components/widgets/Label";

export default function Home() {
  return <RequiresUsername>Hello</RequiresUsername>;
}
